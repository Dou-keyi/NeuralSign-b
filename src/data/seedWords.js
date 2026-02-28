/**
 * Seed Words Data
 * 20 ASL word signs organized into 4 categories for MVP
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

export const seedWords = [
    // ============================================
    // GREETINGS & POLITE PHRASES (6 words)
    // ============================================
    {
        id: 'please',
        type: 'word',
        category: 'greetings',
        englishText: 'Please',
        aslGloss: 'PLEASE',
        difficulty: 1,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'chest',
        movement: 'circular',
        movementSpeed: 'moderate',
        movementRange: 'small',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Place your flat hand on your chest and make small circular motions.',
        shortDescription: 'Hand circles on chest',
        commonMistakes: [
            'Moving hand up-down instead of circular',
            'Hand too far from chest'
        ],
        learningTips: [
            'Think of rubbing your heart gently',
            'Keep fingers together'
        ],
        usage: 'Used when making polite requests',
        exampleSentences: ['Please help me', 'Can I have water, please?'],
        relatedSigns: ['thank-you', 'sorry'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.3, max: 0.5 } },
            motionPattern: { type: 'circular', minFrames: 15 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'polite', 'essential'],
        popularity: 95
    },
    {
        id: 'thank-you',
        type: 'word',
        category: 'greetings',
        englishText: 'Thank you',
        aslGloss: 'THANK-YOU',
        difficulty: 1,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'chin',
        movement: 'forward',
        movementSpeed: 'moderate',
        movementRange: 'medium',
        facialExpression: 'smile',
        facialExpressionRequired: false,
        description: 'Touch your chin with your fingertips, then move your hand forward and slightly down.',
        shortDescription: 'Chin to forward motion',
        commonMistakes: [
            'Starting too far from chin',
            'Moving hand upward instead of forward'
        ],
        learningTips: [
            'Start with fingers touching your chin',
            'Move hand as if throwing a gentle kiss'
        ],
        usage: 'Express gratitude',
        exampleSentences: ['Thank you for helping', 'Thank you very much'],
        relatedSigns: ['please', 'sorry'],
        validation: {
            handPosition: { x: { min: 0.45, max: 0.55 }, y: { min: 0.2, max: 0.35 } },
            motionPattern: { type: 'forward', minFrames: 10 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'polite', 'essential'],
        popularity: 98
    },
    {
        id: 'sorry',
        type: 'word',
        category: 'greetings',
        englishText: 'Sorry',
        aslGloss: 'SORRY',
        difficulty: 1,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'chest',
        movement: 'circular',
        movementSpeed: 'moderate',
        movementRange: 'small',
        facialExpression: 'apologetic',
        facialExpressionRequired: true,
        description: 'Make a fist with your hand and rub it in a circular motion on your chest. Show an apologetic expression.',
        shortDescription: 'Fist circles on chest',
        commonMistakes: [
            'Using flat hand instead of fist',
            'Not showing apologetic expression'
        ],
        learningTips: [
            "Similar to 'please' but with a fist",
            'Your facial expression is important - look apologetic'
        ],
        usage: 'Apologize or express regret',
        exampleSentences: ["I'm sorry", "Sorry, I didn't mean to"],
        relatedSigns: ['please', 'thank-you'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.3, max: 0.5 } },
            motionPattern: { type: 'circular', minFrames: 15 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'polite', 'emotion'],
        popularity: 85
    },
    {
        id: 'yes',
        type: 'word',
        category: 'greetings',
        englishText: 'Yes',
        aslGloss: 'YES',
        difficulty: 1,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'neutral-space',
        movement: 'up-down',
        movementSpeed: 'moderate',
        movementRange: 'small',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: "Make an 'S' handshape (fist) and nod it up and down like a head nodding yes.",
        shortDescription: 'Fist nods up-down',
        commonMistakes: [
            'Moving entire arm instead of just wrist',
            'Making movement too large'
        ],
        learningTips: [
            'Think of your fist as a head nodding',
            'Keep motion small and controlled'
        ],
        usage: 'Affirmative response, agreement',
        exampleSentences: ['Yes, I understand', 'Yes, please'],
        relatedSigns: ['no'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.4, max: 0.6 } },
            motionPattern: { type: 'up-down', minFrames: 8 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'essential', 'response'],
        popularity: 99
    },
    {
        id: 'no',
        type: 'word',
        category: 'greetings',
        englishText: 'No',
        aslGloss: 'NO',
        difficulty: 1,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'neutral-space',
        movement: 'close',
        movementSpeed: 'fast',
        movementRange: 'small',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Extend index and middle fingers, then quickly snap them down to meet your thumb (like a mouth closing).',
        shortDescription: 'Fingers snap to thumb',
        commonMistakes: [
            'Moving too slowly',
            'Not bringing fingers all the way to thumb'
        ],
        learningTips: [
            "Think of a mouth saying 'no' and closing",
            'Make it a quick, crisp motion'
        ],
        usage: 'Negative response, disagreement',
        exampleSentences: ['No, thank you', "No, I don't want"],
        relatedSigns: ['yes'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.4, max: 0.6 } },
            motionPattern: { type: 'close', minFrames: 5 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'essential', 'response'],
        popularity: 99
    },
    {
        id: 'help',
        type: 'word',
        category: 'greetings',
        englishText: 'Help',
        aslGloss: 'HELP',
        difficulty: 2,
        isStatic: false,
        handedness: 'both',
        twoHanded: true,
        location: 'neutral-space',
        movement: 'up',
        movementSpeed: 'moderate',
        movementRange: 'medium',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Place your dominant fist on your non-dominant flat palm, then lift both hands upward together.',
        shortDescription: 'Fist on palm lifts up',
        commonMistakes: [
            'Not keeping hands together',
            'Moving hands in different directions'
        ],
        learningTips: [
            'Think of one hand helping lift the other',
            'Keep both hands touching'
        ],
        usage: 'Request or offer assistance',
        exampleSentences: ['I need help', 'Can you help me?', 'How can I help?'],
        relatedSigns: ['please', 'thank-you'],
        validation: {
            handPosition: { x: { min: 0.35, max: 0.65 }, y: { min: 0.4, max: 0.6 } },
            twoHandedCheck: true,
            motionPattern: { type: 'up', minFrames: 10 },
            confidenceThreshold: 0.7
        },
        tags: ['essential', 'emergency', 'two-handed'],
        popularity: 92
    },

    // ============================================
    // PRONOUNS (6 words)
    // ============================================
    {
        id: 'i-me',
        type: 'word',
        category: 'pronouns',
        englishText: 'I / Me',
        aslGloss: 'ME',
        difficulty: 1,
        isStatic: true,
        handedness: 'right',
        twoHanded: false,
        location: 'chest',
        movement: 'static',
        movementSpeed: 'none',
        movementRange: 'none',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Point to yourself with your index finger on your chest.',
        shortDescription: 'Point to chest',
        commonMistakes: [
            'Pointing too far from chest',
            'Using multiple fingers'
        ],
        learningTips: [
            'Simple - just point to yourself',
            'Touch or nearly touch your chest'
        ],
        usage: 'Refer to yourself',
        exampleSentences: ['I want water', "That's me", 'I need help'],
        relatedSigns: ['you', 'we'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.35, max: 0.55 } },
            requiredLandmarks: [0, 8],
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'essential', 'pronoun'],
        popularity: 100
    },
    {
        id: 'you',
        type: 'word',
        category: 'pronouns',
        englishText: 'You',
        aslGloss: 'YOU',
        difficulty: 1,
        isStatic: true,
        handedness: 'right',
        twoHanded: false,
        location: 'neutral-space',
        movement: 'static',
        movementSpeed: 'none',
        movementRange: 'none',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Point forward toward the person you\'re addressing with your index finger.',
        shortDescription: 'Point forward',
        commonMistakes: [
            'Not pointing directly at person',
            'Pointing downward or upward'
        ],
        learningTips: [
            'Simply point at the person',
            'Keep arm extended'
        ],
        usage: "Refer to the person you're talking to",
        exampleSentences: ['You are nice', 'Do you want water?', 'Thank you'],
        relatedSigns: ['i-me', 'we', 'they-them'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.4, max: 0.6 } },
            requiredLandmarks: [0, 8],
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'essential', 'pronoun'],
        popularity: 100
    },
    {
        id: 'we',
        type: 'word',
        category: 'pronouns',
        englishText: 'We',
        aslGloss: 'WE',
        difficulty: 2,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'chest',
        movement: 'arc',
        movementSpeed: 'moderate',
        movementRange: 'medium',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Point your index finger at yourself, then move it in an arc to the opposite side of your chest (including others).',
        shortDescription: 'Point self to arc across',
        commonMistakes: [
            'Not starting at self',
            'Making arc too small'
        ],
        learningTips: [
            'Start by pointing at yourself',
            'Arc across to include others'
        ],
        usage: 'Refer to yourself and others as a group',
        exampleSentences: ['We are friends', 'We want to help', 'We understand'],
        relatedSigns: ['i-me', 'you', 'they-them'],
        validation: {
            handPosition: { x: { min: 0.35, max: 0.65 }, y: { min: 0.35, max: 0.55 } },
            motionPattern: { type: 'arc', minFrames: 12 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'pronoun', 'group'],
        popularity: 85
    },
    {
        id: 'he-him',
        type: 'word',
        category: 'pronouns',
        englishText: 'He / Him',
        aslGloss: 'HE',
        difficulty: 1,
        isStatic: true,
        handedness: 'right',
        twoHanded: false,
        location: 'neutral-space',
        movement: 'static',
        movementSpeed: 'none',
        movementRange: 'none',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: "Point forward or to the side toward the male person you're referring to.",
        shortDescription: 'Point at male person',
        commonMistakes: [
            'Forgetting to indicate direction',
            'Using when person is not present'
        ],
        learningTips: [
            'Point in the direction of the person',
            'Can point to the side if person is not in front'
        ],
        usage: 'Refer to a male person',
        exampleSentences: ['He is my friend', 'He needs help'],
        relatedSigns: ['she-her', 'they-them', 'you'],
        validation: {
            handPosition: { x: { min: 0.3, max: 0.7 }, y: { min: 0.4, max: 0.6 } },
            requiredLandmarks: [0, 8],
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'pronoun'],
        popularity: 80
    },
    {
        id: 'she-her',
        type: 'word',
        category: 'pronouns',
        englishText: 'She / Her',
        aslGloss: 'SHE',
        difficulty: 1,
        isStatic: true,
        handedness: 'right',
        twoHanded: false,
        location: 'neutral-space',
        movement: 'static',
        movementSpeed: 'none',
        movementRange: 'none',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: "Point forward or to the side toward the female person you're referring to.",
        shortDescription: 'Point at female person',
        commonMistakes: [
            'Not indicating direction',
            "Confusing with 'he'"
        ],
        learningTips: [
            "Same as 'he' but for female person",
            "Context matters - who you're pointing at"
        ],
        usage: 'Refer to a female person',
        exampleSentences: ['She is my friend', 'She wants water'],
        relatedSigns: ['he-him', 'they-them', 'you'],
        validation: {
            handPosition: { x: { min: 0.3, max: 0.7 }, y: { min: 0.4, max: 0.6 } },
            requiredLandmarks: [0, 8],
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'pronoun'],
        popularity: 80
    },
    {
        id: 'they-them',
        type: 'word',
        category: 'pronouns',
        englishText: 'They / Them',
        aslGloss: 'THEY',
        difficulty: 1,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'neutral-space',
        movement: 'sweep',
        movementSpeed: 'moderate',
        movementRange: 'medium',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Point forward and sweep your finger to the side, indicating multiple people.',
        shortDescription: 'Point and sweep',
        commonMistakes: [
            'Not sweeping to indicate multiple people',
            'Too small movement'
        ],
        learningTips: [
            "Point and move to show 'more than one'",
            'Can also point multiple times'
        ],
        usage: 'Refer to multiple people or non-binary person',
        exampleSentences: ['They are here', 'They want to help'],
        relatedSigns: ['we', 'you', 'he-him', 'she-her'],
        validation: {
            handPosition: { x: { min: 0.3, max: 0.7 }, y: { min: 0.4, max: 0.6 } },
            motionPattern: { type: 'sweep', minFrames: 8 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'pronoun', 'plural'],
        popularity: 75
    },

    // ============================================
    // BASIC NOUNS (4 words)
    // ============================================
    {
        id: 'water',
        type: 'word',
        category: 'nouns',
        englishText: 'Water',
        aslGloss: 'WATER',
        difficulty: 1,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'mouth',
        movement: 'tap',
        movementSpeed: 'fast',
        movementRange: 'small',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: "Form a 'W' with three fingers (index, middle, ring) and tap your mouth twice.",
        shortDescription: 'W taps mouth',
        commonMistakes: [
            'Using wrong finger configuration',
            'Only tapping once',
            'Not touching mouth'
        ],
        learningTips: [
            "Three fingers up for 'W'",
            'Tap your mouth 2-3 times'
        ],
        usage: 'Request or refer to water',
        exampleSentences: ['I want water', 'Can I have water?', 'Water please'],
        relatedSigns: ['food'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.2, max: 0.35 } },
            motionPattern: { type: 'tap', minFrames: 6, repetitions: 2 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'essential', 'need'],
        popularity: 90
    },
    {
        id: 'food',
        type: 'word',
        category: 'nouns',
        englishText: 'Food',
        aslGloss: 'FOOD',
        difficulty: 1,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'mouth',
        movement: 'tap',
        movementSpeed: 'moderate',
        movementRange: 'small',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Bring fingertips together and tap them against your mouth several times (like putting food in your mouth).',
        shortDescription: 'Fingertips tap mouth',
        commonMistakes: [
            'Fingers not together',
            'Not actually touching mouth',
            'Moving away from mouth instead of toward'
        ],
        learningTips: [
            'Think of bringing food to your mouth',
            'Keep fingers bunched together'
        ],
        usage: 'Refer to food or eating',
        exampleSentences: ['I want food', 'The food is good', 'Food please'],
        relatedSigns: ['water'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.2, max: 0.35 } },
            motionPattern: { type: 'tap', minFrames: 8, repetitions: 3 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'essential', 'need'],
        popularity: 88
    },
    {
        id: 'home',
        type: 'word',
        category: 'nouns',
        englishText: 'Home',
        aslGloss: 'HOME',
        difficulty: 2,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'face-side',
        movement: 'arc',
        movementSpeed: 'moderate',
        movementRange: 'small',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: "Touch your fingertips to your mouth, then move them to your cheek (representing 'eat' and 'sleep' at home).",
        shortDescription: 'Mouth to cheek motion',
        commonMistakes: [
            'Not touching both mouth and cheek',
            'Moving hand too far'
        ],
        learningTips: [
            'Start at mouth (eat) and end at cheek (sleep)',
            'Represents activities done at home'
        ],
        usage: "Refer to one's home or house",
        exampleSentences: ["I'm going home", 'My home is here', 'Welcome home'],
        relatedSigns: ['family'],
        validation: {
            handPosition: { x: { min: 0.45, max: 0.65 }, y: { min: 0.2, max: 0.4 } },
            motionPattern: { type: 'arc', minFrames: 10 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'place', 'common'],
        popularity: 82
    },
    {
        id: 'family',
        type: 'word',
        category: 'nouns',
        englishText: 'Family',
        aslGloss: 'FAMILY',
        difficulty: 3,
        isStatic: false,
        handedness: 'both',
        twoHanded: true,
        location: 'neutral-space',
        movement: 'circular',
        movementSpeed: 'moderate',
        movementRange: 'large',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: "Make 'F' handshapes with both hands (thumb and index finger touching, other fingers extended). Start with hands together, then move them apart in a circular motion until they come back together.",
        shortDescription: 'F hands circle together',
        commonMistakes: [
            'Not using F handshape',
            'Hands not coming back together',
            'Circle too small'
        ],
        learningTips: [
            'Both hands make the letter F',
            'Think of circling to include everyone in family'
        ],
        usage: 'Refer to family members collectively',
        exampleSentences: ['My family is here', 'I love my family'],
        relatedSigns: ['home'],
        validation: {
            handPosition: { x: { min: 0.3, max: 0.7 }, y: { min: 0.4, max: 0.6 } },
            twoHandedCheck: true,
            motionPattern: { type: 'circular', minFrames: 20 },
            confidenceThreshold: 0.7
        },
        tags: ['intermediate', 'relationship', 'two-handed'],
        popularity: 75
    },

    // ============================================
    // SIMPLE VERBS (4 words)
    // ============================================
    {
        id: 'want',
        type: 'word',
        category: 'verbs',
        englishText: 'Want',
        aslGloss: 'WANT',
        difficulty: 2,
        isStatic: false,
        handedness: 'both',
        twoHanded: true,
        location: 'chest',
        movement: 'pull-back',
        movementSpeed: 'moderate',
        movementRange: 'medium',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Hold both hands in front of you with palms up and fingers slightly curved, then pull them back toward your body (like pulling something toward you).',
        shortDescription: 'Palms pull toward body',
        commonMistakes: [
            'Palms facing wrong direction',
            'Not pulling toward body',
            'Hands too far apart'
        ],
        learningTips: [
            'Think of pulling something you want toward yourself',
            'Start with hands forward, palms up'
        ],
        usage: 'Express desire or need',
        exampleSentences: ['I want water', 'Do you want help?', 'I want to go home'],
        relatedSigns: ['need', 'go', 'come'],
        validation: {
            handPosition: { x: { min: 0.35, max: 0.65 }, y: { min: 0.4, max: 0.6 } },
            twoHandedCheck: true,
            motionPattern: { type: 'pull-back', minFrames: 10 },
            confidenceThreshold: 0.7
        },
        tags: ['essential', 'desire', 'two-handed'],
        popularity: 94
    },
    {
        id: 'need',
        type: 'word',
        category: 'verbs',
        englishText: 'Need',
        aslGloss: 'NEED',
        difficulty: 2,
        isStatic: false,
        handedness: 'right',
        twoHanded: false,
        location: 'neutral-space',
        movement: 'down',
        movementSpeed: 'moderate',
        movementRange: 'medium',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: "Make an 'X' handshape (bent index finger) and move it downward firmly (like pointing at something you must have).",
        shortDescription: 'X hand moves down firmly',
        commonMistakes: [
            'Not using X handshape',
            'Moving too gently - should be firm',
            'Moving at angle instead of straight down'
        ],
        learningTips: [
            'Make an X with your finger',
            'Move down with firm motion (not gentle)'
        ],
        usage: 'Express necessity or requirement',
        exampleSentences: ['I need help', 'I need water', 'Do you need this?'],
        relatedSigns: ['want', 'help'],
        validation: {
            handPosition: { x: { min: 0.4, max: 0.6 }, y: { min: 0.35, max: 0.65 } },
            motionPattern: { type: 'down', minFrames: 8 },
            confidenceThreshold: 0.7
        },
        tags: ['essential', 'necessity'],
        popularity: 90
    },
    {
        id: 'go',
        type: 'word',
        category: 'verbs',
        englishText: 'Go',
        aslGloss: 'GO',
        difficulty: 1,
        isStatic: false,
        handedness: 'both',
        twoHanded: true,
        location: 'neutral-space',
        movement: 'forward',
        movementSpeed: 'fast',
        movementRange: 'medium',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Point both index fingers forward, then move them forward and slightly bend them (like directing someone to go).',
        shortDescription: 'Fingers point and move forward',
        commonMistakes: [
            'Not using both hands',
            'Moving too slowly',
            'Not bending fingers at end'
        ],
        learningTips: [
            "Think of directing someone 'go that way'",
            'Quick, decisive motion'
        ],
        usage: 'Indicate movement or departure',
        exampleSentences: ["Let's go", 'I need to go', 'Go home'],
        relatedSigns: ['come', 'want'],
        validation: {
            handPosition: { x: { min: 0.35, max: 0.65 }, y: { min: 0.4, max: 0.6 } },
            twoHandedCheck: true,
            motionPattern: { type: 'forward', minFrames: 8 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'movement', 'two-handed'],
        popularity: 85
    },
    {
        id: 'come',
        type: 'word',
        category: 'verbs',
        englishText: 'Come',
        aslGloss: 'COME',
        difficulty: 1,
        isStatic: false,
        handedness: 'both',
        twoHanded: true,
        location: 'neutral-space',
        movement: 'toward',
        movementSpeed: 'moderate',
        movementRange: 'medium',
        facialExpression: 'neutral',
        facialExpressionRequired: false,
        description: 'Hold both index fingers up and pointing away, then rotate and bring them toward your body (beckoning motion).',
        shortDescription: 'Fingers beckon toward body',
        commonMistakes: [
            'Moving away instead of toward',
            'Not using both hands',
            'Not rotating fingers'
        ],
        learningTips: [
            'Think of beckoning someone to come closer',
            'Start pointing away, end pointing at yourself'
        ],
        usage: 'Invite someone to approach or join',
        exampleSentences: ['Come here', 'Come with me', 'Come inside'],
        relatedSigns: ['go', 'want'],
        validation: {
            handPosition: { x: { min: 0.35, max: 0.65 }, y: { min: 0.4, max: 0.6 } },
            twoHandedCheck: true,
            motionPattern: { type: 'toward', minFrames: 10 },
            confidenceThreshold: 0.7
        },
        tags: ['basic', 'invitation', 'two-handed'],
        popularity: 80
    }
];

// ============================================
// CATEGORY DEFINITIONS
// ============================================

export const seedCategories = [
    {
        id: 'greetings',
        name: 'Greetings & Polite Phrases',
        description: 'Essential phrases for starting conversations and being polite',
        icon: '👋',
        color: '#10B981',
        order: 1,
        signCount: 6,
        isFoundational: true,
        recommendedAfter: ['alphabet']
    },
    {
        id: 'pronouns',
        name: 'Pronouns',
        description: 'Refer to yourself and others in conversation',
        icon: '👤',
        color: '#3B82F6',
        order: 2,
        signCount: 6,
        isFoundational: true,
        recommendedAfter: ['greetings']
    },
    {
        id: 'nouns',
        name: 'Basic Nouns',
        description: 'Common objects, places, and concepts',
        icon: '🏠',
        color: '#8B5CF6',
        order: 3,
        signCount: 4,
        isFoundational: true,
        recommendedAfter: ['pronouns']
    },
    {
        id: 'verbs',
        name: 'Simple Verbs',
        description: 'Actions and activities for everyday communication',
        icon: '🏃',
        color: '#EC4899',
        order: 4,
        signCount: 4,
        isFoundational: false,
        recommendedAfter: ['nouns']
    }
];

export default seedWords;
