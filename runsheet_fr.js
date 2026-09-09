// Runsheet for the face recognition task.
//
// 40 encoding trials (participants view each face for 5 seconds, no response
// required), followed by 40 two-alternative-forced-choice (2AFC) memory
// trials in the same order.
//
// Two between-subject groups, set via a global defined in index.html:
//   condition_assignment: 's1' (mole rule in trials 1-20) | 's2' (mole rule in trials 21-40)
//
// Rule-half images ALWAYS carry a mole; non-rule-half images NEVER do.
//
// Depends on globals from stimuli_fr.js (faceIdentities, facePath) and on
// jsPsych / jsPsychHtmlKeyboardResponse / jsPsychTwoAFC being available.

var N_MAIN = 40;
var RULE_HALF_SIZE = 20;

// Populated by buildFaceExperimentTimeline() — must be called AFTER Math.random
// has been seeded (see bottom of index.html) and before these are referenced.
var encodingTrialTimeline = [];
var twoafcTrialTimeline = [];

// ── Rule / feature assignment ────────────────────────────────────────────────

function isRuleHalf(trialNum) {
    if (condition_assignment === 's1') return trialNum <= RULE_HALF_SIZE;
    return trialNum > RULE_HALF_SIZE; // s2
}

// Returns {hasMole, ruleActive} for a given 1-indexed trial number.
function assignFeatures(trialNum) {
    var ruleActive = isRuleHalf(trialNum);
    return { hasMole: ruleActive, ruleActive: ruleActive }; // deterministic: mole present iff in the rule half
}

// Human-readable description of the participant's rule, for the debrief screen.
function ruleFeatureDescription() {
    return 'had at least one mole';
}

// ── Encoding trial ────────────────────────────────────────────────────────────

var ENCODING_IMG_ID = 'encoding-face-img';
var ENCODING_DURATION_MS = 5000;

function makeEncodingTrial(identity, hasMole, trialNum, totalTrials) {
    var imgSrc = facePath(identity, hasMole);
    return {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function () {
            var counter = '<p style="text-align:center; color:#888; font-size:16px;">Face ' + trialNum + ' of ' + totalTrials + '</p>';
            return counter +
                '<div style="text-align:center; margin-bottom:20px;">' +
                '<img id="' + ENCODING_IMG_ID + '" src="' + imgSrc + '" style="width:500px; border-radius:8px; border:1px solid #ccc;" />' +
                '</div>';
        },
        choices: 'NO_KEYS',
        trial_duration: ENCODING_DURATION_MS,
        data: {
            trial_id: 'encoding',
            trial_num: trialNum,
            identity: identity,
            has_mole: hasMole,
            rule_active: isRuleHalf(trialNum)
        }
    };
}

// ── 2AFC memory trial ──────────────────────────────────────────────────────

function makeTwoAFCTrial(identity, hasMole, ruleActive, trialNum, totalTrials) {
    return {
        type: jsPsychTwoAFC,
        identity: identity,
        correct_variant: hasMole ? 'both' : 'no-mole',
        trial_num: trialNum,
        n_trials: totalTrials,
        data: {
            trial_id: 'twoafc',
            studied_has_mole: hasMole,
            rule_active: ruleActive
        }
    };
}

var twoafcInstruction = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="max-width:800px; margin:60px auto; font-family:Arial; font-size:19px; line-height:1.7; text-align:left;">' +
               '<p style="font-size:24px; font-weight:bold; text-align:center;">Part 2: Memory test</p>' +
               '<p>You will now see <strong>two versions</strong> of each face you studied, presented together side by side. They differ slightly in some details.</p>' +
               '<p>Please click on the <strong>one image</strong> that shows exactly the face you saw earlier. Then rate how confident you are in your choice.</p>' +
               '<p>The faces will be tested in the <strong>same order</strong> you saw them before.</p>' +
               '<p style="font-size:18px; color:#555; margin-top:30px; text-align:center;">Press any key to begin.</p>' +
               '</div>',
    choices: 'ALL_KEYS'
};

// ── Build the two main timelines ─────────────────────────────────────────────
// Must be called after Math.random has been seeded for the participant.
function buildFaceExperimentTimeline() {
    encodingTrialTimeline = [];
    twoafcTrialTimeline = [];

    var shuffledIdentities = jsPsych.randomization.shuffle(faceIdentities).slice(0, N_MAIN);

    for (var i = 0; i < N_MAIN; i++) {
        var trialNum = i + 1;
        var identity = shuffledIdentities[i];
        var feat = assignFeatures(trialNum);

        encodingTrialTimeline.push(
            makeEncodingTrial(identity, feat.hasMole, trialNum, N_MAIN)
        );
        twoafcTrialTimeline.push(
            makeTwoAFCTrial(identity, feat.hasMole, feat.ruleActive, trialNum, N_MAIN)
        );
    }
}
