/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */

/**
 * 🗳️ Panchayat Election System - Capstone Solution
 */

// 1. createElection: The central hub using Closures and Callbacks
export function createElection(candidates) {
    // PRIVATE STATE
    const registeredVoters = new Map(); // Store voter objects by ID
    const votedIds = new Set(); // Track who has already voted
    let votesTally = {}; // { candidateId: count }

    // Initialize tally for all candidates
    candidates.forEach((c) => {
        votesTally[c.id] = 0;
    });

    return {
        registerVoter(voter) {
            if (!voter || !voter.id || voter.age < 18) return false;
            if (registeredVoters.has(voter.id)) return false;

            registeredVoters.set(voter.id, voter);
            return true;
        },

        castVote(voterId, candidateId, onSuccess, onError) {
            // Validation Logic
            if (!registeredVoters.has(voterId)) return onError("Voter not registered");
            if (votedIds.has(voterId)) return onError("Already voted");
            if (!candidates.find((c) => c.id === candidateId)) return onError("Invalid candidate");

            // Record Vote using our Pure Function logic (conceptually)
            votesTally = tallyPure(votesTally, candidateId);
            votedIds.add(voterId);

            return onSuccess({ voterId, candidateId });
        },

        getResults(sortFn) {
            const results = candidates.map((c) => ({
                ...c,
                votes: votesTally[c.id] || 0,
            }));

            if (typeof sortFn === "function") {
                return results.sort(sortFn);
            }

            // Default: Sort by votes descending
            return results.sort((a, b) => b.votes - a.votes);
        },

        getWinner() {
            const results = this.getResults();
            if (results.length === 0 || results.every((r) => r.votes === 0)) {
                return null;
            }
            // Since results are sorted descending by default, index 0 is the winner
            return results[0];
        },
    };
}

// 2. createVoteValidator: FACTORY pattern
export function createVoteValidator(rules) {
    return function (voter) {
        const { minAge, requiredFields } = rules;

        for (let field of requiredFields) {
            if (voter[field] === undefined || voter[field] === null || voter[field] === "") {
                return { valid: false, reason: `Missing field: ${field}` };
            }
        }

        if (voter.age < minAge) {
            return { valid: false, reason: "Underage" };
        }

        return { valid: true, reason: "Valid voter" };
    };
}

// 3. countVotesInRegions: RECURSION
export function countVotesInRegions(regionTree) {
    if (!regionTree || typeof regionTree.votes !== "number") return 0;

    let total = regionTree.votes;

    if (Array.isArray(regionTree.subRegions)) {
        total += regionTree.subRegions.reduce((sum, sub) => {
            return sum + countVotesInRegions(sub);
        }, 0);
    }

    return total;
}

// 4. tallyPure: PURE FUNCTION (No Side Effects)
export function tallyPure(currentTally, candidateId) {
    // Create a shallow copy to maintain immutability
    const newTally = { ...currentTally };

    // Increment or initialize
    newTally[candidateId] = (newTally[candidateId] || 0) + 1;

    return newTally;
}
