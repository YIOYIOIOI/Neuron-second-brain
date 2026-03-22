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
    backlinks: ['2']
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
    backlinks: ['1', '4']
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
    backlinks: []
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
    backlinks: ['2']
  }
];
