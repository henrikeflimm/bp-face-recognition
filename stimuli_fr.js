// Face stimuli for the face recognition task.
//
// Each face identity has two variants, stored in subfolders of
// face-examples/ under the SAME filename:
//   face-examples/both/<identity>.png     - has a mole
//   face-examples/no-mole/<identity>.png  - no mole
//
// Both folders are fully populated for all identities.

var faceExamplesBase = 'face-examples/';

var faceIdentities = [
    'am-20s-gssleekponytail',
    'am-50s-bssleekponytail',
    'am-50s-lsbdown-2',
    'arab-40s-1',
    'arab-40s-2',
    'balk-20s-lgheadband',
    'balk-30s-l',
    'ch-40s-braids',
    'ch-50-shsgr',
    'ch-50s-sb',
    'ch-50s-sh-1',
    'eur-20s-bllsbun-2',
    'eur-20s-bssleekbun',
    'eur-30s-lbraids',
    'eur-50s-glheadband-1',
    'eur-50s-glheadband-2',
    'eur-50s-lgdown',
    'ind-20s-braiddls-1',
    'ind-30s-ldownheadband-1',
    'ind-30s-ldownheadband-2',
    'ind-50s-sdw-3',
    'kor-20s-dlsponytail-3',
    'kor-40s-bslsbangs-1',
    'kor-50s-dss-3',
    'kor-50s-gldown',
    'latam-((50s))-chighlights',
    'latam-30s-cbun-2',
    'latam-50s-dlc',
    'latam-50s-shsgrdown',
    'medit-20s-d',
    'medit-20s-dbangs',
    'medit-20s-dsbob-1',
    'mor-30s-ldown',
    'mor-40s-shc',
    'scand-20s-blsbun-1',
    'scand-30s-gcbun',
    'scand-40s-blols',
    'scand-40s-grbob-2',
    'sea-20s-ls-2',
    'sea-30s-blbraids-1'
    // NOTE: only 40 identities are needed for the main task. Add more
    // filenames here (and matching files in face-examples/both/ and
    // face-examples/no-mole/) if you want to rotate stimulus sets or
    // replace any of these.
];

// Path to a specific identity/mole-variant image.
function facePath(identity, hasMole) {
    return faceExamplesBase + (hasMole ? 'both' : 'no-mole') + '/' + identity + '.png';
}
