import type { SlideData as TopicSlideData, SimulationDriver } from '../components/TopicRenderer';

function buildRunFunction(simulationCode?: string): SimulationDriver | undefined {
  if (!simulationCode) return undefined;
  try {
    // If the code contains a named function, evaluate it and return that function.
    // Wrap in an IIFE to avoid leaking into global scope.
    const wrapped = `(function(){\n${simulationCode}\n// return the first function defined in this scope\nfor (const k in this) { if (typeof this[k] === 'function') return this[k]; }\nreturn undefined;\n})()`;
    // eslint-disable-next-line no-new-func
    const fn = new Function(wrapped)();
    if (typeof fn === 'function') return fn as SimulationDriver;

    // Fallback: try to build a function from the code as a body that receives canvas
    // eslint-disable-next-line no-new-func
    const fallback = new Function('canvas', simulationCode) as SimulationDriver;
    return fallback;
  } catch (err) {
    // If evaluation fails, return undefined and let the caller render a placeholder
    // console.error('Failed to build simulation function', err);
    return undefined;
  }
}

function adaptSlide(raw: any): TopicSlideData | null {
  const type = raw?.type;
  const id = raw?.id ?? raw?.ID ?? Math.random();
  switch (type) {
    case 'intro':
      return { id, type: 'intro', title: raw.title || '', subtitle: raw.subtitle || '', meta: raw.meta } as TopicSlideData;
    case 'quote':
      return { id, type: 'quote', text: raw.text || '', author: raw.author } as TopicSlideData;
    case 'concept-list':
      return { id, type: 'concept-list', title: raw.title || '', items: Array.isArray(raw.items) ? raw.items : [], context: raw.context } as TopicSlideData;
    case 'concept-split':
      return { id, type: 'concept-split', title: raw.title || '', leftContent: raw.leftContent || raw.left || '', rightPoints: Array.isArray(raw.rightPoints) ? raw.rightPoints : raw.right || [] } as TopicSlideData;
    case 'comparison':
      return { id, type: 'comparison', title: raw.title || '', leftTitle: raw.leftTitle || '', leftPoints: Array.isArray(raw.leftPoints) ? raw.leftPoints : [], rightTitle: raw.rightTitle || '', rightPoints: Array.isArray(raw.rightPoints) ? raw.rightPoints : [] } as TopicSlideData;
    case 'process':
      return { id, type: 'process', title: raw.title || '', steps: Array.isArray(raw.steps) ? raw.steps : [] } as TopicSlideData;
    case 'equation':
      return { id, type: 'equation', title: raw.title || '', latex: raw.latex || raw.equation || '', description: raw.description || '', variables: Array.isArray(raw.variables) ? raw.variables : [] } as TopicSlideData;
    case 'quiz':
      return { id, type: 'quiz', question: raw.question || '', options: Array.isArray(raw.options) ? raw.options : [], correctIndex: typeof raw.correctIndex === 'number' ? raw.correctIndex : 0, explanation: raw.explanation || '' } as TopicSlideData;
    case 'true-false':
      return { id, type: 'true-false', statement: raw.statement || '', isTrue: Boolean(raw.isTrue), explanation: raw.explanation || '' } as TopicSlideData;
    case 'summary':
      return { id, type: 'summary', title: raw.title || '', recap: Array.isArray(raw.recap) ? raw.recap : [] } as TopicSlideData;
    case 'outro':
      return { id, type: 'outro', title: raw.title || '', text: raw.text || '' } as TopicSlideData;
    case 'simulation': {
      const simulationCode = raw.simulationCode || raw.simulation || raw.runCode || raw.code;
      const runFn = buildRunFunction(simulationCode);
      if (!runFn) return null;
      return { id, type: 'simulation', title: raw.title || '', description: raw.description || '', run: runFn } as TopicSlideData;
    }
    default:
      return null;
  }
}

export default function adaptGeneratedSlides(rawSlides: any[]): TopicSlideData[] {
  if (!Array.isArray(rawSlides)) return [];
  const result: TopicSlideData[] = [];
  let idx = 1;
  for (const r of rawSlides) {
    const s = adaptSlide(r);
    if (s) {
      // ensure numeric ids starting at 1
      s.id = idx++;
      result.push(s);
    }
  }
  // Fallback minimal slides if none produced
  if (result.length === 0) {
    result.push({ id: 1, type: 'intro', title: 'Generated Topic', subtitle: 'Intro' } as TopicSlideData);
    result.push({ id: 2, type: 'concept-list', title: 'Key Ideas', items: ['Main idea 1', 'Main idea 2', 'Main idea 3'] } as TopicSlideData);
    result.push({ id: 3, type: 'summary', title: 'Summary', recap: ['Remember the main idea'] } as TopicSlideData);
  }
  return result;
}
