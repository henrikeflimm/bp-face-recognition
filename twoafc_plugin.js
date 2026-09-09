// Two-Alternative Forced Choice Plugin for jsPsych 7
// Shows the two mole variants (with mole / without mole) of a single studied
// face identity, side by side in a random left-to-right order.
// Phase 1: click on the image the participant thinks they saw at encoding.
// Phase 2: confidence slider (50% = guess, given 2AFC chance level, to 100%).
//
// Depends on facePath() from stimuli_fr.js, which must be loaded before this
// script.

var jsPsychTwoAFC = (function (jspsych) {
    'use strict';

    const info = {
        name: 'two-afc',
        parameters: {
            identity: {
                type: jspsych.ParameterType.STRING,
                default: null,
                description: 'Face identity basename studied at encoding.'
            },
            correct_variant: {
                type: jspsych.ParameterType.STRING,
                default: null,
                description: "Mole variant shown at encoding: 'no-mole' | 'both'."
            },
            image_size: {
                type: jspsych.ParameterType.INT,
                default: [650, 650]
            },
            background_colour: {
                type: jspsych.ParameterType.STRING,
                default: 'white'
            },
            prompt: {
                type: jspsych.ParameterType.STRING,
                default: 'Which one of these two images did you see earlier?'
            },
            trial_num: {
                type: jspsych.ParameterType.INT,
                default: null,
                description: 'Position of this face in the test (1-indexed), matching its position at encoding.'
            },
            n_trials: {
                type: jspsych.ParameterType.INT,
                default: null,
                description: 'Total number of faces in the test.'
            }
        }
    };

    class TwoAFCPlugin {

        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            const self = this;
            const variants = ['no-mole', 'both'];
            const order = self.jsPsych.randomization.shuffle(variants);

            // Size the 1x2 grid to fit the viewport (participants' screens vary a lot on
            // Prolific), capped at trial.image_size so it doesn't grow huge on large screens.
            const gap = 20;
            const reservedVertical = trial.trial_num !== null ? 155 : 130; // counter + prompt text + top/bottom padding
            const reservedHorizontal = 80; // side padding + grid gap allowance
            const maxCellFromHeight = Math.floor(window.innerHeight - reservedVertical - gap);
            const maxCellFromWidth = Math.floor((window.innerWidth - reservedHorizontal - gap) / 2);
            const cellSize = Math.max(160, Math.min(trial.image_size[0], maxCellFromHeight, maxCellFromWidth));
            const imgW = cellSize;
            const imgH = cellSize;

            const response = {
                choice: null,
                choice_correct: null,
                choice_rt: null,
                confidence: null
            };

            const startTime = performance.now();

            let html = `<div style="background:${trial.background_colour}; min-height:100vh; padding-top:20px; padding-bottom:20px; font-family:Arial; box-sizing:border-box;">`;
            if (trial.trial_num !== null && trial.n_trials !== null) {
                html += `<p style="text-align:center; color:#888; font-size:16px; margin-bottom:16px;">Face ${trial.trial_num} of ${trial.n_trials}</p>`;
            }
            html += `<p style="text-align:center; font-size:22px; margin-bottom:20px;">${trial.prompt}</p>`;
            html += `<div id="twoafc-options" style="display:grid; grid-template-columns: repeat(2, ${imgW}px); grid-template-rows: ${imgH}px; gap:${gap}px; justify-content:center;">`;
            order.forEach(function (variant) {
                html += `<div class="twoafc-option" data-variant="${variant}" style="cursor:pointer; border:4px solid transparent; border-radius:8px; padding:6px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; background:#f4f4f4;">`;
                html += `<img data-variant-img="${variant}" style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain; display:block; border-radius:4px;" />`;
                html += `</div>`;
            });
            html += `</div></div>`;

            display_element.innerHTML = html;

            // Set image sources via JS (avoids string-escaping issues with
            // identity names that contain special characters).
            order.forEach(function (variant) {
                const img = display_element.querySelector('[data-variant-img="' + variant + '"]');
                const hasMole = (variant === 'both');
                img.src = facePath(trial.identity, hasMole);
            });

            const optionEls = display_element.querySelectorAll('.twoafc-option');
            optionEls.forEach(function (el) {
                el.addEventListener('click', function () {
                    if (response.choice !== null) return;
                    optionEls.forEach(function (o) { o.style.borderColor = 'transparent'; });
                    el.style.borderColor = '#0055cc';
                    const variant = el.getAttribute('data-variant');
                    response.choice = variant;
                    response.choice_correct = (variant === trial.correct_variant);
                    response.choice_rt = performance.now() - startTime;
                    self.jsPsych.pluginAPI.setTimeout(showConfidence, 250);
                });
            });

            // ── Phase 2: Confidence slider (50%–100%, matching 2AFC chance level) ──
            function showConfidence() {
                display_element.innerHTML = `
                    <div style="width:800px; margin:100px auto; text-align:center; font-family:Arial;">
                        <p style="font-size:24px; margin-bottom:30px;">
                            How confident are you in your choice?
                        </p>
                        <div style="display:flex; justify-content:space-between; font-size:20px; margin-bottom:10px;">
                            <span>Guess (50%)</span>
                            <span>Very confident (100%)</span>
                        </div>
                        <div id="conf-track" style="
                            width:100%; height:60px;
                            background:linear-gradient(to right, #ff4444, #ffaa00, #44ff44);
                            border-radius:10px; cursor:pointer; position:relative; margin:20px 0;">
                        </div>
                        <div id="conf-value" style="font-size:36px; font-weight:bold; min-height:44px;"></div>
                        <p style="font-size:18px; color:#666; margin-top:10px;">
                            Move mouse over the bar and click to confirm
                        </p>
                    </div>`;

                const track = document.getElementById('conf-track');
                const display = document.getElementById('conf-value');
                let clicked = false;

                function pctFromEvent(e) {
                    const rect = track.getBoundingClientRect();
                    return Math.round(50 + Math.max(0, Math.min(50,
                        (e.clientX - rect.left) / rect.width * 50)));
                }

                track.addEventListener('mousemove', function (e) {
                    if (clicked) return;
                    display.textContent = pctFromEvent(e) + '%';
                });

                track.addEventListener('click', function (e) {
                    if (clicked) return;
                    clicked = true;
                    response.confidence = pctFromEvent(e);
                    self.jsPsych.pluginAPI.setTimeout(endTrial, 400);
                });
            }

            // ── End trial ────────────────────────────────────────────
            function endTrial() {
                self.jsPsych.pluginAPI.clearAllTimeouts();
                display_element.innerHTML = '';
                self.jsPsych.finishTrial({
                    identity: trial.identity,
                    correct_variant: trial.correct_variant,
                    option_order: order,
                    choice: response.choice,
                    choice_correct: response.choice_correct,
                    choice_rt: response.choice_rt,
                    confidence: response.confidence
                });
            }

        } // end trial()
    } // end class

    TwoAFCPlugin.info = info;
    return TwoAFCPlugin;

})(jsPsychModule);
