
import { readFileSync } from "node:fs";
import test, { before, after } from "node:test";
import { initializeTestEnvironment, assertFails, assertSucceeds, } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc,  deleteDoc, serverTimestamp } from "firebase/firestore";

const projectId = "next01-58f77";

const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: {
    host: "127.0.0.1",
    port: 8080,
    rules: readFileSync("firestore.rules", "utf8"),
  },
});

before(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

test("NEXT01: Another user cannot read my profile", async () => {
  const otherUser = testEnv.authenticatedContext("other-user-001", {
    email: "other@example.com",
  });

  const db = otherUser.firestore();

  await assertFails(
    getDoc(doc(db, "users", "test-user-001"))
  );
});

test("NEXT01: User can read own profile", async () => {
  const user = testEnv.authenticatedContext("test-user-001", {
    email: "testuser@example.com",
  });

  const db = user.firestore();

  const profileRef = doc(db, "users", "test-user-001");

  const profile = await getDoc(profileRef);

  if (profile.exists()) {
    console.log("User profile exists.");
  } else {
    console.log("User profile does not exist yet.");
  }
});

test("NEXT01: User can create own profile with serverTimestamp", async () => {
  const userId = "create-test-user-001";
  const email = "create-test@example.com";

  const user = testEnv.authenticatedContext(userId, {
    email,
  });

  const db = user.firestore();
  const profileRef = doc(db, "users", userId);

  await setDoc(profileRef, {
    uid: userId,
    displayName: "Test User",
    email: email,
    photoURL: "",
    fullName: "NEXT01 Test User",
    dateOfBirth: "2000-01-01",
    mobileNumber: "0771234567",
    occupation: "Student",
    createdAt: serverTimestamp(),
  });

  const profile = await getDoc(profileRef);

  if (!profile.exists()) {
    throw new Error("Profile was not created.");
  }

  console.log("Profile created successfully.");
});

test("NEXT01: User can update own profile", async () => {
  const userId = "update-test-user-001";
  const email = "update-test@example.com";

  const user = testEnv.authenticatedContext(userId, {
    email,
  });

  const db = user.firestore();
  const profileRef = doc(db, "users", userId);

  // Step 1: Create a valid profile
  await setDoc(profileRef, {
    uid: userId,
    displayName: "Test User",
    email: email,
    photoURL: "",
    fullName: "Original Name",
    dateOfBirth: "2000-01-01",
    mobileNumber: "0771234567",
    occupation: "Student",
    createdAt: serverTimestamp(),
  });

  // Step 2: Update allowed fields
  await updateDoc(profileRef, {
    fullName: "Updated Name",
    occupation: "Software Developer",
    updatedAt: serverTimestamp(),
  });

  // Step 3: Verify the updated data
  const profile = await getDoc(profileRef);

  if (profile.data()?.fullName !== "Updated Name") {
    throw new Error("Profile name was not updated.");
  }

  if (profile.data()?.occupation !== "Software Developer") {
    throw new Error("Occupation was not updated.");
  }

  if (!profile.data()?.updatedAt) {
    throw new Error("updatedAt timestamp is missing.");
  }

  console.log("Profile updated successfully.");
});

test("NEXT01: Another user cannot update my profile", async () => {
  const ownerId = "profile-owner-001";
  const otherUserId = "unauthorized-user-001";

  // Create the profile as its rightful owner
  const owner = testEnv.authenticatedContext(ownerId, {
    email: "owner@example.com",
  });

  const profileRef = doc(owner.firestore(), "users", ownerId);

  await setDoc(profileRef, {
    uid: ownerId,
    displayName: "Profile Owner",
    email: "owner@example.com",
    photoURL: "",
    fullName: "Original Owner",
    dateOfBirth: "2000-01-01",
    mobileNumber: "0771234567",
    occupation: "Student",
    createdAt: serverTimestamp(),
  });

  // Attempt to update the profile as another user
  const otherUser = testEnv.authenticatedContext(otherUserId, {
    email: "other@example.com",
  });

  await assertFails(
    updateDoc(
      doc(otherUser.firestore(), "users", ownerId),
      {
        fullName: "Unauthorized Change",
        updatedAt: serverTimestamp(),
      }
    )
  );

  // Confirm the original data remains unchanged
  const profile = await getDoc(profileRef);

  if (profile.data()?.fullName !== "Original Owner") {
    throw new Error("Unauthorized profile modification detected.");
  }

  console.log("Unauthorized profile update blocked.");
});

test("NEXT01: User cannot modify protected profile fields", async () => {
  const userId = "protected-fields-user-001";
  const email = "protected@example.com";

  const user = testEnv.authenticatedContext(userId, {
    email,
  });

  const db = user.firestore();
  const profileRef = doc(db, "users", userId);

  // Create a valid profile
  await setDoc(profileRef, {
    uid: userId,
    displayName: "Protected User",
    email,
    photoURL: "",
    fullName: "Original Name",
    dateOfBirth: "2000-01-01",
    mobileNumber: "0771234567",
    occupation: "Student",
    createdAt: serverTimestamp(),
  });

  // Attempt to change protected fields
  await assertFails(
    updateDoc(profileRef, {
      uid: "another-user-id",
      updatedAt: serverTimestamp(),
    })
  );

  await assertFails(
    updateDoc(profileRef, {
      email: "changed@example.com",
      updatedAt: serverTimestamp(),
    })
  );

  await assertFails(
    updateDoc(profileRef, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );

  // Confirm original values are preserved
  const profile = await getDoc(profileRef);
  const data = profile.data();

  if (data?.uid !== userId || data?.email !== email) {
    throw new Error("Protected profile fields were modified.");
  }

  console.log("Protected profile fields remain unchanged.");
});

test("NEXT01: User cannot delete own profile", async () => {
  const userId = "delete-test-user-001";
  const email = "delete-test@example.com";

  const user = testEnv.authenticatedContext(userId, {
    email,
  });

  const db = user.firestore();
  const profileRef = doc(db, "users", userId);

  // Create a valid profile
  await setDoc(profileRef, {
    uid: userId,
    displayName: "Delete Test User",
    email,
    photoURL: "",
    fullName: "NEXT01 Delete Test",
    dateOfBirth: "2000-01-01",
    mobileNumber: "0771234567",
    occupation: "Student",
    createdAt: serverTimestamp(),
  });

  // Attempt to delete the profile
  await assertFails(deleteDoc(profileRef));

  // Confirm the profile still exists
  const profile = await getDoc(profileRef);

  if (!profile.exists()) {
    throw new Error("Profile was deleted unexpectedly.");
  }

  console.log("Profile deletion successfully blocked.");
});

test("NEXT01: User cannot create another user's profile", async () => {
  const attackerId = "attacker-user-001";
  const victimId = "victim-user-001";

  const attacker = testEnv.authenticatedContext(attackerId, {
    email: "attacker@example.com",
  });

  const db = attacker.firestore();

  // Attempt to create a profile belonging to another user
  const victimProfileRef = doc(db, "users", victimId);

  await assertFails(
    setDoc(victimProfileRef, {
      uid: victimId,
      displayName: "Victim User",
      email: "attacker@example.com",
      photoURL: "",
      fullName: "Fake Profile",
      dateOfBirth: "2000-01-01",
      mobileNumber: "0771234567",
      occupation: "Student",
      createdAt: serverTimestamp(),
    })
  );

  console.log("Unauthorized profile creation blocked.");
});

test("NEXT01: User cannot create profile with mismatched email", async () => {
  const userId = "email-security-user-001";
  const authenticatedEmail = "realuser@example.com";
  const fakeEmail = "fakeuser@example.com";

  const user = testEnv.authenticatedContext(userId, {
    email: authenticatedEmail,
  });

  const db = user.firestore();
  const profileRef = doc(db, "users", userId);

  // Attempt to create a profile with a different email
  await assertFails(
    setDoc(profileRef, {
      uid: userId,
      displayName: "Email Security Test",
      email: fakeEmail,
      photoURL: "",
      fullName: "Test User",
      dateOfBirth: "2000-01-01",
      mobileNumber: "0771234567",
      occupation: "Student",
      createdAt: serverTimestamp(),
    })
  );

  // Confirm the invalid profile was not created
  const profile = await getDoc(profileRef);

  if (profile.exists()) {
    throw new Error("Profile created with mismatched email.");
  }

  console.log("Mismatched email profile creation blocked.");
});

test("NEXT01: Unauthenticated user cannot read profile", async () => {
  const db = testEnv.unauthenticatedContext().firestore();

  await assertFails(
    getDoc(doc(db, "users", "test-user-001"))
  );

  console.log("Unauthenticated profile access blocked.");
});

test("NEXT01: Regular user cannot create a poll", async () => {
  const user = testEnv.authenticatedContext("poll-test-user-001", {
    email: "polluser@example.com",
  });

  const db = user.firestore();
  const pollRef = doc(db, "polls", "unauthorized-poll-001");

  await assertFails(
    setDoc(pollRef, {
      title: "Unauthorized Poll",
      question: "Should this poll be allowed?",
      options: ["Yes", "No"],
      status: "published",
      createdAt: serverTimestamp(),
    })
  );

  console.log("Unauthorized poll creation blocked.");
});

test("NEXT01: Signed-in user can read published poll", async () => {
  const pollId = "published-poll-test-001";

  // Create test poll using emulator admin privileges
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Public Opinion",
      question: "Do you like NEXT01?",
      options: ["Yes", "No"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  // Read poll as a normal signed-in user
  const user = testEnv.authenticatedContext("poll-reader-001", {
    email: "reader@example.com",
  });

  const pollRef = doc(user.firestore(), "polls", pollId);

  const poll = await assertSucceeds(getDoc(pollRef));

  if (!poll.exists()) {
    throw new Error("Published poll was not found.");
  }

  if (poll.data()?.status !== "published") {
    throw new Error("Poll status is incorrect.");
  }

  console.log("Published poll read successfully.");
});

test("NEXT01: Signed-in user cannot read draft poll", async () => {
  const pollId = "draft-poll-test-001";

  // Create draft poll using local emulator admin context
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Draft Poll",
      question: "Should this draft poll be visible?",
      options: ["Yes", "No"],
      status: "draft",
      createdAt: serverTimestamp(),
    });
  });

  // Attempt to read draft poll as a normal signed-in user
  const user = testEnv.authenticatedContext("draft-reader-001", {
    email: "draftreader@example.com",
  });

  const db = user.firestore();
  const pollRef = doc(db, "polls", pollId);

  await assertFails(getDoc(pollRef));

  console.log("Draft poll access successfully blocked.");
});

test("NEXT01: Signed-in user can vote on published poll", async () => {
  const pollId = "voting-poll-test-001";
  const userId = "voting-user-001";

  // Create published poll using local emulator admin context
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Voting Test",
      question: "Do you support NEXT01?",
      options: ["Yes", "No"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  // Vote as an authenticated user
  const user = testEnv.authenticatedContext(userId, {
    email: "voter@example.com",
  });

  const db = user.firestore();
  const voteRef = doc(db, "polls", pollId, "votes", userId);

  await assertSucceeds(
    setDoc(voteRef, {
      optionIndex: 0,
      createdAt: serverTimestamp(),
    })
  );

  // Verify that the vote was saved
  const vote = await getDoc(voteRef);

  if (!vote.exists()) {
    throw new Error("Vote was not saved.");
  }

  if (vote.data()?.optionIndex !== 0) {
    throw new Error("Incorrect vote option saved.");
  }

  console.log("Published poll vote saved successfully.");
});

test("NEXT01: User cannot vote twice on same poll", async () => {
  const pollId = "double-vote-test-001";
  const userId = "double-vote-user-001";

  // Create published poll using local emulator admin context
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Double Vote Test",
      question: "Which option do you prefer?",
      options: ["Option A", "Option B"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  const user = testEnv.authenticatedContext(userId, {
    email: "doublevoter@example.com",
  });

  const db = user.firestore();
  const voteRef = doc(db, "polls", pollId, "votes", userId);

  // First vote should succeed
  await assertSucceeds(
    setDoc(voteRef, {
      optionIndex: 0,
      createdAt: serverTimestamp(),
    })
  );

  // Second vote should be blocked
  await assertFails(
    setDoc(voteRef, {
      optionIndex: 1,
      createdAt: serverTimestamp(),
    })
  );

  // Confirm original vote remains unchanged
  const vote = await getDoc(voteRef);

  if (vote.data()?.optionIndex !== 0) {
    throw new Error("Original vote was changed.");
  }

  console.log("Double voting successfully blocked.");
});

test("NEXT01: User cannot vote using another user's UID", async () => {
  const pollId = "vote-identity-test-001";
  const attackerId = "vote-attacker-001";
  const victimId = "vote-victim-001";

  // Create published poll using local emulator admin context
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Vote Identity Test",
      question: "Which option do you prefer?",
      options: ["Option A", "Option B"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  // Authenticate as User A
  const attacker = testEnv.authenticatedContext(attackerId, {
    email: "voteattacker@example.com",
  });

  const db = attacker.firestore();

  // Attempt to create a vote using User B's UID
  const victimVoteRef = doc(
    db,
    "polls",
    pollId,
    "votes",
    victimId
  );

  await assertFails(
    setDoc(victimVoteRef, {
      optionIndex: 0,
      createdAt: serverTimestamp(),
    })
  );

  // Verify no vote was created
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    const vote = await getDoc(
      doc(adminDb, "polls", pollId, "votes", victimId)
    );

    if (vote.exists()) {
      throw new Error("Unauthorized vote was created.");
    }
  });

  console.log("Voting with another user's UID blocked.");
});

test("NEXT01: User cannot vote on draft poll", async () => {
  const pollId = "draft-voting-test-001";
  const userId = "draft-voter-001";

  // Create a draft poll in the local emulator
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Draft Voting Test",
      question: "Should voting be allowed?",
      options: ["Yes", "No"],
      status: "draft",
      createdAt: serverTimestamp(),
    });
  });

  // Attempt to vote as a signed-in user
  const user = testEnv.authenticatedContext(userId, {
    email: "draftvoter@example.com",
  });

  const voteRef = doc(
    user.firestore(),
    "polls",
    pollId,
    "votes",
    userId
  );

  await assertFails(
    setDoc(voteRef, {
      optionIndex: 0,
      createdAt: serverTimestamp(),
    })
  );

  // Verify that the rejected vote was not saved
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    const vote = await getDoc(
      doc(adminDb, "polls", pollId, "votes", userId)
    );

    if (vote.exists()) {
      throw new Error("Vote was saved on a draft poll.");
    }
  });

  console.log("Voting on draft poll successfully blocked.");
});

test("NEXT01: User cannot vote with invalid optionIndex", async () => {
  const pollId = "invalid-option-test-001";
  const userId = "invalid-option-user-001";

  // Create a published poll in the local emulator
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Invalid Option Test",
      question: "Which option do you prefer?",
      options: ["Option A", "Option B"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  const user = testEnv.authenticatedContext(userId, {
    email: "invalidoption@example.com",
  });

  const voteRef = doc(
    user.firestore(),
    "polls",
    pollId,
    "votes",
    userId
  );

  // Only optionIndex 0 and 1 are valid
  await assertFails(
    setDoc(voteRef, {
      optionIndex: 5,
      createdAt: serverTimestamp(),
    })
  );

  // Verify that no invalid vote was saved
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    const vote = await getDoc(
      doc(adminDb, "polls", pollId, "votes", userId)
    );

    if (vote.exists()) {
      throw new Error("Invalid vote was saved.");
    }
  });

  console.log("Invalid vote option successfully blocked.");
});

test("NEXT01: User cannot vote with negative optionIndex", async () => {
  const pollId = "negative-option-test-001";
  const userId = "negative-option-user-001";

  // Create a published poll in the local emulator
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Negative Option Test",
      question: "Which option do you prefer?",
      options: ["Option A", "Option B"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  const user = testEnv.authenticatedContext(userId, {
    email: "negativeoption@example.com",
  });

  const voteRef = doc(
    user.firestore(),
    "polls",
    pollId,
    "votes",
    userId
  );

  // A negative optionIndex must be rejected
  await assertFails(
    setDoc(voteRef, {
      optionIndex: -1,
      createdAt: serverTimestamp(),
    })
  );

  // Confirm that the invalid vote was not saved
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    const vote = await getDoc(
      doc(adminDb, "polls", pollId, "votes", userId)
    );

    if (vote.exists()) {
      throw new Error("Negative optionIndex vote was saved.");
    }
  });

  console.log("Negative vote option successfully blocked.");
});

test("NEXT01: User cannot vote with string optionIndex", async () => {
  const pollId = "string-option-test-001";
  const userId = "string-option-user-001";

  // Create a published poll in the local emulator
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 String Option Test",
      question: "Which option do you prefer?",
      options: ["Option A", "Option B"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  const user = testEnv.authenticatedContext(userId, {
    email: "stringoption@example.com",
  });

  const voteRef = doc(
    user.firestore(),
    "polls",
    pollId,
    "votes",
    userId
  );

  // String "0" must be rejected
  await assertFails(
    setDoc(voteRef, {
      optionIndex: "0",
      createdAt: serverTimestamp(),
    })
  );

  // Verify that the invalid vote was not saved
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    const vote = await getDoc(
      doc(adminDb, "polls", pollId, "votes", userId)
    );

    if (vote.exists()) {
      throw new Error("String optionIndex vote was saved.");
    }
  });

  console.log("String vote option successfully blocked.");
});

test("NEXT01: User cannot add extra fields to vote", async () => {
  const pollId = "extra-vote-fields-test-001";
  const userId = "extra-vote-fields-user-001";

  // Create a published poll in the local emulator
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Extra Vote Fields Test",
      question: "Which option do you prefer?",
      options: ["Option A", "Option B"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  const user = testEnv.authenticatedContext(userId, {
    email: "extravotefields@example.com",
  });

  const voteRef = doc(
    user.firestore(),
    "polls",
    pollId,
    "votes",
    userId
  );

  // Attempt to save a vote with an unauthorized field
  await assertFails(
    setDoc(voteRef, {
      optionIndex: 0,
      createdAt: serverTimestamp(),
      isAdmin: true,
    })
  );

  // Verify that the invalid vote was not saved
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    const vote = await getDoc(
      doc(adminDb, "polls", pollId, "votes", userId)
    );

    if (vote.exists()) {
      throw new Error("Vote with extra fields was saved.");
    }
  });

  console.log("Extra vote fields successfully blocked.");
});

test("NEXT01: User cannot delete own vote", async () => {
  const pollId = "vote-delete-test-001";
  const userId = "vote-delete-user-001";

  // Create a published poll in the local emulator
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "polls", pollId), {
      title: "NEXT01 Vote Delete Test",
      question: "Which option do you prefer?",
      options: ["Option A", "Option B"],
      status: "published",
      createdAt: serverTimestamp(),
    });
  });

  const user = testEnv.authenticatedContext(userId, {
    email: "votedelete@example.com",
  });

  const voteRef = doc(
    user.firestore(),
    "polls",
    pollId,
    "votes",
    userId
  );

  // First, create a valid vote
  await assertSucceeds(
    setDoc(voteRef, {
      optionIndex: 0,
      createdAt: serverTimestamp(),
    })
  );

  // Attempt to delete the vote
  await assertFails(
    deleteDoc(voteRef)
  );

  // Verify the original vote still exists
  const vote = await getDoc(voteRef);

  if (!vote.exists()) {
    throw new Error("Vote was deleted.");
  }

  if (vote.data()?.optionIndex !== 0) {
    throw new Error("Original vote was changed.");
  }

  console.log("Vote deletion successfully blocked.");
});

async function seedSecurityPoll(pollId, status = "published") {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "polls", pollId), {
      title: "NEXT01 Security Test",
      question: "Choose an option",
      options: ["Yes", "No"],
      status,
      createdAt: serverTimestamp(),
    });
  });
}

async function seedSecurityVote(pollId, userId) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "polls", pollId, "votes", userId),
      {
        optionIndex: 0,
        createdAt: serverTimestamp(),
      }
    );
  });
}

// 23. Existing votes cannot be updated
test("NEXT01: User cannot update existing vote", async () => {
  const pollId = "security-update-vote";
  const uid = "security-update-user";
  await seedSecurityPoll(pollId);
  await seedSecurityVote(pollId, uid);

  const db = testEnv.authenticatedContext(uid).firestore();
  const ref = doc(db, "polls", pollId, "votes", uid);

  await assertFails(updateDoc(ref, { optionIndex: 1 }));
  const snapshot = await getDoc(ref);
  if (snapshot.data()?.optionIndex !== 0) {
    throw new Error("Vote changed unexpectedly");
  }
});

// 24. Users cannot read other users' votes
test("NEXT01: User cannot read another user's vote", async () => {
  const pollId = "security-private-vote";
  await seedSecurityPoll(pollId);
  await seedSecurityVote(pollId, "vote-owner-24");

  const db = testEnv.authenticatedContext("other-user-24").firestore();
  await assertFails(
    getDoc(doc(db, "polls", pollId, "votes", "vote-owner-24"))
  );
});

// 25. Unauthenticated users cannot vote
test("NEXT01: Guest cannot vote", async () => {
  const pollId = "security-guest-vote";
  await seedSecurityPoll(pollId);

  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(
    setDoc(doc(db, "polls", pollId, "votes", "guest-25"), {
      optionIndex: 0,
      createdAt: serverTimestamp(),
    })
  );
});

// 26. Users cannot create poll results
test("NEXT01: User cannot create poll results", async () => {
  const pollId = "security-create-results";
  await seedSecurityPoll(pollId);

  const db = testEnv.authenticatedContext("user-26").firestore();
  await assertFails(
    setDoc(doc(db, "polls", pollId, "results", "summary"), {
      totalVotes: 999,
    })
  );
});

// 27. Users cannot modify poll results
test("NEXT01: User cannot update poll results", async () => {
  const pollId = "security-update-results";
  await seedSecurityPoll(pollId);

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "polls", pollId, "results", "summary"),
      { totalVotes: 1 }
    );
  });

  const db = testEnv.authenticatedContext("user-27").firestore();
  await assertFails(
    updateDoc(doc(db, "polls", pollId, "results", "summary"), {
      totalVotes: 999,
    })
  );
});

// 28. Published poll summary can be read
test("NEXT01: User can read published poll summary", async () => {
  const pollId = "security-published-summary";
  await seedSecurityPoll(pollId);

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "polls", pollId, "results", "summary"),
      { totalVotes: 3 }
    );
  });

  const db = testEnv.authenticatedContext("user-28").firestore();
  const snapshot = await assertSucceeds(
    getDoc(doc(db, "polls", pollId, "results", "summary"))
  );

  if (!snapshot.exists() || snapshot.data().totalVotes !== 3) {
    throw new Error("Published summary not readable");
  }
});

// 29. Draft poll summary cannot be read
test("NEXT01: User cannot read draft poll summary", async () => {
  const pollId = "security-draft-summary";
  await seedSecurityPoll(pollId, "draft");

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "polls", pollId, "results", "summary"),
      { totalVotes: 2 }
    );
  });

  const db = testEnv.authenticatedContext("user-29").firestore();
  await assertFails(
    getDoc(doc(db, "polls", pollId, "results", "summary"))
  );
});

// 30. Invalid timestamp cannot be used for voting
test("NEXT01: User cannot submit fake vote timestamp", async () => {
  const pollId = "security-fake-timestamp";
  const uid = "user-30";
  await seedSecurityPoll(pollId);

  const db = testEnv.authenticatedContext(uid).firestore();
  await assertFails(
    setDoc(doc(db, "polls", pollId, "votes", uid), {
      optionIndex: 0,
      createdAt: "2020-01-01",
    })
  );
});

// 31. Regular users cannot modify polls
test("NEXT01: User cannot update published poll", async () => {
  const pollId = "security-poll-update";
  await seedSecurityPoll(pollId);

  const db = testEnv.authenticatedContext("user-31").firestore();
  await assertFails(
    updateDoc(doc(db, "polls", pollId), {
      status: "draft",
    })
  );
});

// 32. Regular users cannot delete polls
test("NEXT01: User cannot delete published poll", async () => {
  const pollId = "security-poll-delete";
  await seedSecurityPoll(pollId);

  const db = testEnv.authenticatedContext("user-32").firestore();
  await assertFails(
    deleteDoc(doc(db, "polls", pollId))
  );
});
// NEXT01 Quiz History Security Tests

async function seedQuizHistory(userId, resultId) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), "users", userId, "quizHistory", resultId),
      {
        categoryId: "general-knowledge",
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        completedAt: serverTimestamp(),
      }
    );
  });
}

// 33. Users can read their own quiz history
test("NEXT01: User can read own quiz history", async () => {
  const uid = "quiz-owner-33";
  await seedQuizHistory(uid, "result-33");

  const db = testEnv.authenticatedContext(uid).firestore();
  const resultRef = doc(db, "users", uid, "quizHistory", "result-33");

  const snapshot = await assertSucceeds(getDoc(resultRef));

  if (!snapshot.exists() || snapshot.data()?.score !== 4) {
    throw new Error("Own quiz history was not readable.");
  }
});

// 34. Users cannot read another user's quiz history
test("NEXT01: User cannot read another user's quiz history", async () => {
  const ownerId = "quiz-owner-34";
  await seedQuizHistory(ownerId, "result-34");

  const db = testEnv.authenticatedContext("quiz-other-34").firestore();

  await assertFails(
    getDoc(doc(db, "users", ownerId, "quizHistory", "result-34"))
  );
});

// 35. Guests cannot read quiz history
test("NEXT01: Guest cannot read quiz history", async () => {
  const uid = "quiz-owner-35";
  await seedQuizHistory(uid, "result-35");

  const db = testEnv.unauthenticatedContext().firestore();

  await assertFails(
    getDoc(doc(db, "users", uid, "quizHistory", "result-35"))
  );
});

// 36. Users cannot create fake quiz results
test("NEXT01: User cannot create fake quiz history", async () => {
  const uid = "quiz-user-36";
  const db = testEnv.authenticatedContext(uid).firestore();

  await assertFails(
    setDoc(doc(db, "users", uid, "quizHistory", "fake-result"), {
      categoryId: "general-knowledge",
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      completedAt: serverTimestamp(),
    })
  );
});

// 37. Users cannot modify quiz scores
test("NEXT01: User cannot update quiz history", async () => {
  const uid = "quiz-owner-37";
  await seedQuizHistory(uid, "result-37");

  const db = testEnv.authenticatedContext(uid).firestore();
  const resultRef = doc(db, "users", uid, "quizHistory", "result-37");

  await assertFails(updateDoc(resultRef, { score: 5 }));

  const snapshot = await getDoc(resultRef);

  if (snapshot.data()?.score !== 4) {
    throw new Error("Quiz score was modified.");
  }
});

// 38. Users cannot delete quiz results
test("NEXT01: User cannot delete quiz history", async () => {
  const uid = "quiz-owner-38";
  await seedQuizHistory(uid, "result-38");

  const db = testEnv.authenticatedContext(uid).firestore();
  const resultRef = doc(db, "users", uid, "quizHistory", "result-38");

  await assertFails(deleteDoc(resultRef));

  const snapshot = await getDoc(resultRef);

  if (!snapshot.exists()) {
    throw new Error("Quiz history was deleted.");
  }
});