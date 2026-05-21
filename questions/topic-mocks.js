const QUESTIONS_DATA_TOPIC_MOCKS = [
    {
        id: "topic-math",
        title: "Mathematical Methods of Physics",
        section: "topic",
        topic: "Mathematical Methods",
        total_questions: 2,
        total_marks: 85,
        duration_min: 60,
        is_new: true,
        questions_list: [
            {
                id: "tm-q1",
                part: "B",
                q_number: 1,
                question_text: "Determine the residue value of the complex function $f(z) = e^z / (z^2 + \pi^2)$ calculated over a simple enclosing pole path at $z = i\pi$.",
                option_a: "1 / 2πi",
                option_b: "-1 / 2πi",
                option_c: "1 / 2",
                option_d: "0",
                correct_option: "A",
                explanation: "Evaluated easily using standard limit rules for first-order pole positions."
            },
            {
                id: "tm-q2",
                part: "C",
                q_number: 2,
                question_text: "Find the structural transformation metrics of the Fourier transform mapping functions corresponding directly to the Gaussian profile $f(x) = e^{-x^2}$.",
                option_a: "Self-reciprocal configuration function",
                option_b: "Asymmetric stepping function",
                option_c: "Vanishing delta transform array",
                option_d: "Divergent matrix configuration",
                correct_option: "A",
                explanation: "The Fourier transformation operation maps any standard Gaussian cleanly into another inverse scale Gaussian form."
            }
        ]
    }
];
