import { KnowledgeItem } from '../types';

export const mockKnowledgeBase: KnowledgeItem[] = [
  {
    id: '1',
    title: 'The Architecture of Thought',
    summary: 'Spatial metaphors in digital organization improve cognitive retrieval by mimicking physical architecture.',
    content: 'The way we structure information digitally often mirrors physical architecture. When we build a "second brain," we are essentially constructing a house for our thoughts. This spatial metaphor is not just poetic; it fundamentally alters how we retrieve and synthesize knowledge. \n\nBy creating distinct "rooms" for different types of information, we reduce cognitive load. The key is not rigid categorization, but fluid pathways between concepts, much like hallways connecting different areas of a home.',
    tags: ['Cognitive Science', 'Design', 'Architecture'],
    createdAt: '2025-10-24T10:00:00Z',
    relatedIds: ['2'],
    references: ['2'],
    backlinks: ['2'],
    type: 'note'
  },
  {
    id: '2',
    title: 'Minimalism as a Constraint',
    summary: 'Minimalism is a functional constraint that forces focus on essential elements.',
    content: 'Minimalism is often misunderstood as merely an aesthetic choice—a preference for white space and sans-serif fonts. True minimalism, however, is a functional constraint. \n\nWhen we artificially limit our tools, palette, or space, we force ourselves to focus on the essence of the message. The removal of the superfluous is not about emptiness, but about clarity. In design, every element must justify its existence. If it does not serve a clear purpose, it detracts from the whole.',
    tags: ['Design Theory', 'Creativity'],
    createdAt: '2025-11-02T14:30:00Z',
    relatedIds: ['1', '4'],
    references: ['1', '4'],
    backlinks: ['1', '4'],
    type: 'note'
  },
  {
    id: '3',
    title: 'The Decay of Digital Artifacts',
    summary: 'The internet is fragile, with webpages frequently disappearing due to link rot.',
    content: 'We treat the internet as an eternal archive, yet it is profoundly fragile. The average lifespan of a webpage is roughly 100 days. Link rot—the gradual breaking of hyperlinks as pages are moved or deleted—is eroding our collective digital memory.\n\nTo build a resilient knowledge base, we must shift from a paradigm of "linking" to one of "capturing." Relying on external URLs is a gamble against time. True digital permanence requires local, plain-text archiving.',
    tags: ['Technology', 'Archiving', 'Web'],
    createdAt: '2025-12-15T09:15:00Z',
    relatedIds: [],
    references: [],
    backlinks: [],
    type: 'note'
  },
  {
    id: '4',
    title: 'Typography and Rhythm',
    summary: 'Typography acts as a visual voice, using spacing and layout to control reading rhythm.',
    content: 'Typography is the visual manifestation of voice. Just as a speaker uses pauses and emphasis to convey meaning, a designer uses leading, tracking, and margins to dictate the rhythm of reading.\n\nTight leading creates a sense of urgency, while generous line spacing invites contemplation. The macro-typography (layout) sets the stage, but the micro-typography (the spacing between individual letters and words) determines the texture of the reading experience.',
    tags: ['Typography', 'Design'],
    createdAt: '2026-01-10T16:45:00Z',
    relatedIds: ['2'],
    references: ['2'],
    backlinks: ['2'],
    type: 'note'
  },
  {
    id: '5',
    title: 'Spaced Repetition',
    summary: 'A learning technique that involves reviewing information at increasing intervals to improve long-term retention.',
    content: 'Spaced repetition is based on the spacing effect, where learning is more effective when study sessions are spaced out over time. The optimal intervals increase exponentially: review after 1 day, then 3 days, then 7 days, then 14 days, and so on. This method leverages the psychological spacing effect and is particularly effective for memorizing facts, vocabulary, and concepts.',
    tags: ['Learning', 'Memory', 'Cognitive Science'],
    createdAt: '2026-02-01T08:00:00Z',
    relatedIds: ['6', '7'],
    references: [],
    backlinks: [],
    type: 'concept'
  },
  {
    id: '6',
    title: 'Zettelkasten Method',
    summary: 'A personal knowledge management system using interconnected notes to build a network of ideas.',
    content: 'The Zettelkasten method, developed by sociologist Niklas Luhmann, is a note-taking system that emphasizes atomic notes and linking. Each note should contain one idea and be linked to related notes. The power comes from the connections between notes, creating a web of knowledge that mirrors how our brain works. Key principles: atomicity (one idea per note), connectivity (link related ideas), and progressive summarization.',
    tags: ['PKM', 'Note-taking', 'Productivity'],
    createdAt: '2026-02-05T10:30:00Z',
    relatedIds: ['5', '8'],
    references: [],
    backlinks: [],
    type: 'concept'
  },
  {
    id: '7',
    title: 'Ebbinghaus Forgetting Curve',
    summary: 'A mathematical formula describing the decline of memory retention over time without reinforcement.',
    content: 'Hermann Ebbinghaus discovered that memory retention drops exponentially after learning. Without review, we forget approximately 50% of new information within an hour, 70% within 24 hours, and 90% within a week. The curve demonstrates why spaced repetition is effective: by reviewing at strategic intervals, we can flatten the forgetting curve and move information into long-term memory.',
    tags: ['Psychology', 'Memory', 'Learning'],
    createdAt: '2026-02-08T14:15:00Z',
    relatedIds: ['5'],
    references: [],
    backlinks: [],
    type: 'concept'
  },
  {
    id: '8',
    title: 'Atomic Notes',
    summary: 'The practice of breaking down information into small, self-contained units that express a single idea.',
    content: 'Atomic notes are the building blocks of a knowledge management system. Each note should be: (1) Autonomous - understandable on its own, (2) Atomic - contains exactly one idea, (3) Connected - linked to related notes. This granularity allows for flexible recombination of ideas and prevents notes from becoming unwieldy. The smaller the unit, the more reusable it becomes.',
    tags: ['PKM', 'Note-taking', 'Knowledge Management'],
    createdAt: '2026-02-12T09:45:00Z',
    relatedIds: ['6'],
    references: [],
    backlinks: [],
    type: 'concept'
  },
  {
    id: '9',
    title: 'Meeting Notes: Q1 Product Planning',
    summary: 'Discussed roadmap priorities, resource allocation, and timeline for Q1 2026 product releases.',
    content: 'Attendees: Sarah (PM), Mike (Eng), Lisa (Design)\n\nKey Decisions:\n- Prioritize mobile app redesign over new features\n- Allocate 2 engineers to performance optimization\n- Launch beta by March 15th\n\nAction Items:\n- Sarah: Draft PRD by Feb 20\n- Mike: Technical feasibility assessment\n- Lisa: User research interviews (10 participants)\n\nRisks: Tight timeline, dependency on API team',
    tags: ['Meeting', 'Product', 'Planning'],
    createdAt: '2026-02-14T15:00:00Z',
    relatedIds: [],
    references: [],
    backlinks: [],
    type: 'note'
  },
  {
    id: '10',
    title: 'Progressive Summarization',
    summary: 'A note-taking technique that involves highlighting and summarizing in multiple passes to distill key insights.',
    content: 'Progressive summarization, developed by Tiago Forte, is a four-layer approach: (1) Original text, (2) Bold the important parts, (3) Highlight the most important bolded parts, (4) Write a summary at the top. This method allows you to quickly scan notes and find the essence without re-reading everything. Each layer adds value and makes future retrieval faster.',
    tags: ['Note-taking', 'Productivity', 'PKM'],
    createdAt: '2026-02-16T11:20:00Z',
    relatedIds: ['6', '8'],
    references: [],
    backlinks: [],
    type: 'concept'
  },
  {
    id: '11',
    title: 'Book Notes: Atomic Habits',
    summary: 'Key insights from James Clear\'s book on building good habits and breaking bad ones.',
    content: 'Main Ideas:\n- Habits are the compound interest of self-improvement\n- Focus on systems, not goals\n- The Four Laws: Make it obvious, attractive, easy, and satisfying\n- Identity-based habits: "I am a runner" vs "I want to run"\n- The 1% rule: Small improvements compound over time\n\nPersonal Takeaway: Start with 2-minute habits to build momentum. Link new habits to existing ones (habit stacking).',
    tags: ['Books', 'Habits', 'Self-improvement'],
    createdAt: '2026-02-18T20:30:00Z',
    relatedIds: [],
    references: [],
    backlinks: [],
    type: 'note'
  },
  {
    id: '12',
    title: 'Feynman Technique',
    summary: 'A learning method that involves explaining concepts in simple terms to identify knowledge gaps.',
    content: 'Named after physicist Richard Feynman, this technique has four steps: (1) Choose a concept, (2) Explain it in simple language as if teaching a child, (3) Identify gaps in your explanation, (4) Review and simplify further. The act of teaching forces you to understand deeply. If you can\'t explain it simply, you don\'t understand it well enough.',
    tags: ['Learning', 'Teaching', 'Understanding'],
    createdAt: '2026-02-20T13:00:00Z',
    relatedIds: ['5', '7'],
    references: [],
    backlinks: [],
    type: 'concept'
  }
];
