import {
    Injectable,
    InternalServerErrorException,
    BadRequestException
} from '@nestjs/common'

// GenerationService:  integrates with Google Gemini via REST, parses and sanitizes output

export type SlideType = |
    'intro' |
    'quote' |
    'concept-list' |
    'concept-split' |
    'comparison' |
    'process' |
    'equation' |
    'quiz' |
    'true-false' |
    'summary' |
    'outro' |
    'simulation'

export interface BaseSlide {
    id: number;type: SlideType;title ? : string
}
export interface IntroSlide extends BaseSlide {
    type: 'intro';subtitle: string;meta ? : string
}
export interface QuoteSlide extends BaseSlide {
    type: 'quote';text: string;author ? : string
}
export interface ConceptListSlide extends BaseSlide {
    type: 'concept-list';title: string;items: string[];context ? : string
}
export interface ConceptSplitSlide extends BaseSlide {
    type: 'concept-split';title: string;leftContent: string;rightPoints: string[]
}
export interface ComparisonSlide extends BaseSlide {
    type: 'comparison';title: string;leftTitle ? : string;leftPoints: string[];rightTitle ? : string;rightPoints: string[]
}
export interface ProcessSlide extends BaseSlide {
    type: 'process';title: string;steps: {
        label: string;desc: string
    } []
}
export interface EquationSlide extends BaseSlide {
    type: 'equation';title ? : string;latex: string;description ? : string;variables ? : {
        symbol: string;meaning: string
    } []
}
export interface QuizSlide extends BaseSlide {
    type: 'quiz';question: string;options: string[];correctIndex: number;explanation ? : string
}
export interface TrueFalseSlide extends BaseSlide {
    type: 'true-false';statement: string;isTrue: boolean;explanation ? : string
}
export interface SummarySlide extends BaseSlide {
    type: 'summary';title ? : string;recap: string[]
}
export interface OutroSlide extends BaseSlide {
    type: 'outro';title ? : string;text: string
}
export interface SimulationSlide extends BaseSlide {
    type: 'simulation';
    title: string;
    description: string;
    simulationCode?:  string; // The function source as a string
}
export type SlideData = IntroSlide | QuoteSlide | ConceptListSlide | ConceptSplitSlide | ComparisonSlide | ProcessSlide | EquationSlide | QuizSlide | TrueFalseSlide | SummarySlide | OutroSlide | SimulationSlide

export interface GeminiOptions {
    model ? : string;
    temperature ? : number
}

function safeString(v: any, fallback = '') {
    if (typeof v === 'string') return v.trim();
    if (v == null) return fallback;
    try {
        return String(v).trim()
    } catch {
        return fallback
    }
}

function safeArray < T > (v: any, fallback: T[] = []) {
    return Array.isArray(v) ? v : fallback
}

function sanitizeIntro(s: any, id: number): IntroSlide | null {
    const subtitle = safeString(s?. subtitle);
    if (! subtitle) return null;
    return {
        id,
        type: 'intro',
        title: safeString(s?.title, 'Untitled'),
        subtitle,
        meta: safeString(s?.meta, '')
    }
}

function sanitizeQuote(s: any, id: number): QuoteSlide | null {
    const text = safeString(s?.text);
    if (!text) return null;
    return {
        id,
        type: 'quote',
        text,
        author: safeString(s?.author, '')
    }
}

function sanitizeConceptList(s: any, id: number): ConceptListSlide | null {
    const title = safeString(s?.title);
    const items = safeArray(s?.items).map((it: any) => safeString(it)).filter(Boolean);
    if (!title || items.length === 0) return null;
    return {
        id,
        type: 'concept-list',
        title,
        items,
        context: safeString(s?.context, '')
    }
}

function sanitizeConceptSplit(s: any, id: number): ConceptSplitSlide | null {
    const title = safeString(s?.title);
    const left = safeString(s?.leftContent);
    const right = safeArray(s?.rightPoints).map((r: any) => safeString(r)).filter(Boolean);
    if (!title || ! left) return null;
    return {
        id,
        type: 'concept-split',
        title,
        leftContent: left,
        rightPoints: right
    }
}

function sanitizeComparison(s: any, id:  number): ComparisonSlide | null {
    const title = safeString(s?.title);
    const leftPoints = safeArray(s?.leftPoints).map((p: any) => safeString(p)).filter(Boolean);
    const rightPoints = safeArray(s?.rightPoints).map((p: any) => safeString(p)).filter(Boolean);
    if (!title || (! leftPoints.length && !rightPoints.length)) return null;
    return {
        id,
        type: 'comparison',
        title,
        leftTitle: safeString(s?.leftTitle, ''),
        leftPoints,
        rightTitle: safeString(s?.rightTitle, ''),
        rightPoints
    }
}

function sanitizeProcess(s: any, id: number): ProcessSlide | null {
    const title = safeString(s?.title);
    const steps = safeArray(s?.steps).map((st: any, i: number) => ({
        label: safeString(st?.label, `Step ${i + 1}`),
        desc: safeString(st?.desc, '')
    })).filter(Boolean);
    if (!title || steps.length === 0) return null;
    return {
        id,
        type: 'process',
        title,
        steps
    }
}

function sanitizeEquation(s: any, id:  number): EquationSlide | null {
    const latex = safeString(s?.latex);
    if (!latex) return null;
    const variables = safeArray(s?.variables).map((v: any) => ({
        symbol: safeString(v?.symbol),
        meaning: safeString(v?.meaning)
    })).filter(v => v.symbol);
    return {
        id,
        type: 'equation',
        title: safeString(s?.title, ''),
        latex,
        description: safeString(s?.description, ''),
        variables
    }
}

function sanitizeQuiz(s: any, id:  number): QuizSlide | null {
    const question = safeString(s?.question);
    const options = safeArray(s?.options).map((o: any) => safeString(o)).filter(Boolean);
    const correctIndex = Number. isFinite(Number(s?.correctIndex)) ? Number(s?.correctIndex) : -1;
    if (!question || options.length < 2 || correctIndex < 0 || correctIndex >= options.length) return null;
    return {
        id,
        type: 'quiz',
        question,
        options,
        correctIndex,
        explanation: safeString(s?.explanation, '')
    }
}

function sanitizeTrueFalse(s: any, id: number): TrueFalseSlide | null {
    const statement = safeString(s?.statement);
    if (!statement) return null;
    const isTrue = Boolean(s?.isTrue);
    return {
        id,
        type: 'true-false',
        statement,
        isTrue,
        explanation: safeString(s?.explanation, '')
    }
}

function sanitizeSummary(s: any, id: number): SummarySlide | null {
    const recap = safeArray(s?.recap).map((r: any) => safeString(r)).filter(Boolean);
    if (recap.length === 0) return null;
    return {
        id,
        type: 'summary',
        title: safeString(s?.title, 'Summary'),
        recap
    }
}

function sanitizeOutro(s: any, id:  number): OutroSlide | null {
    return {
        id,
        type: 'outro',
        title: safeString(s?.title, 'Done'),
        text: safeString(s?.text, 'Great job!')
    }
}

function sanitizeSimulation(s: any, id: number): SimulationSlide | null {
    const title = safeString(s?. title);
    const description = safeString(s?.description);
    if (!title || !description) return null;
    return {
        id,
        type: 'simulation',
        title,
        description,
        simulationCode: safeString(s?.simulationCode, '')
    };
}

function sanitizeSlideRaw(raw: any, id: number): SlideData | null {
    const type = safeString(raw?.type) as SlideType;
    switch (type) {
        case 'intro':
            return sanitizeIntro(raw, id);
        case 'quote':
            return sanitizeQuote(raw, id);
        case 'concept-list':
            return sanitizeConceptList(raw, id);
        case 'concept-split': 
            return sanitizeConceptSplit(raw, id);
        case 'comparison':
            return sanitizeComparison(raw, id);
        case 'process':
            return sanitizeProcess(raw, id);
        case 'equation':
            return sanitizeEquation(raw, id);
        case 'quiz':
            return sanitizeQuiz(raw, id);
        case 'true-false':
            return sanitizeTrueFalse(raw, id);
        case 'summary':
            return sanitizeSummary(raw, id);
        case 'outro':
            return sanitizeOutro(raw, id);
        case 'simulation':
            return sanitizeSimulation(raw, id);
        default:
            return null
    }
}

function sanitizeSlides(parsed: any): SlideData[] {
    const arr = Array.isArray(parsed) ? parsed : [];
    const cleaned: SlideData[] = [];
    let id = 1;
    for (const raw of arr) {
        const s = sanitizeSlideRaw(raw, id);
        if (s) {
            cleaned.push(s);
            id += 1
        }
    }
    if (cleaned.length === 0) {
        const fallbackSlides: SlideData[] = [
            {
                id: 1,
                type:  'intro',
                title:  'Generated Topic',
                subtitle: 'Quick intro'
            },
            {
                id: 2,
                type: 'concept-list',
                title: 'Key Ideas',
                items: ['Main idea 1', 'Main idea 2', 'Main idea 3']
            },
            {
                id: 3,
                type:  'summary',
                title: 'Summary',
                recap: ['Remember the main idea']
            }
        ];
        cleaned.push(...fallbackSlides);
    }
    return cleaned
}

async function callGeminiRaw(fullPrompt: string, geminiApiKey: string, opts: GeminiOptions = {}) {
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY')
    const model = opts.model || 'gemini-2.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
    const body = {
        contents: [{
            role: 'user',
            parts: [{
                text: fullPrompt
            }]
        }],
        generationConfig: {
            temperature: opts.temperature ?? 0.5
        }
    }
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiApiKey
        },
        body: JSON.stringify(body)
    })
    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${t}`)
    }
    const json: any = await res.json()
    const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || '').join('') || json?.candidates?.[0]?.output || JSON.stringify(json)
    return {
        raw: json,
        text
    }
}

function buildSystemPrompt(): string {
    return `You are a friendly teacher who uses the Feynman technique to explain hard topics simply to 8th/9th graders.  Use short sentences, simple analogies, and NO jargon. 

OUTPUT FORMAT (VERY STRICT):
- Return ONLY a single valid JavaScript/TypeScript module (no surrounding explanation, no extra text).
- The module must export one constant whose name is \`SLIDES_<TOPIC_SLUG>\` where \`<TOPIC_SLUG>\` is the topic uppercased with non-alphanumeric replaced by underscore (example: \`Simple harmonic Motion\` -> \`SLIDES_SIMPLE_HARMONIC_MOTION\`).
- The exported constant must be assigned to an array of slide objects exactly matching the schema below.  Use numeric \`id\` starting at 1.
- Do NOT include JSX, imports, or React code in the module. Keep it pure JS/TS (functions + export const).
- Allowed slide \`type\` values and required fields (strict):
  - \`intro\`: \`{ id, type: 'intro', title, subtitle, meta?  }\`
  - \`quote\`: \`{ id, type: 'quote', text, author? }\`
  - \`concept-list\`: \`{ id, type: 'concept-list', title, items:  string[], context? }\`
  - \`concept-split\`: \`{ id, type: 'concept-split', title, leftContent, rightPoints: string[] }\`
  - \`comparison\`: \`{ id, type: 'comparison', title, leftTitle, leftPoints: string[], rightTitle, rightPoints:  string[] }\`
  - \`process\`: \`{ id, type: 'process', title, steps: { label, desc }[] }\`
  - \`equation\`: \`{ id, type: 'equation', title?, latex, description, variables:  { symbol, meaning }[] }\`
  - \`quiz\`: \`{ id, type: 'quiz', question, options:  string[], correctIndex:  number, explanation }\`
  - \`true-false\`: \`{ id, type: 'true-false', statement, isTrue:  boolean, explanation }\`
  - \`summary\`: \`{ id, type: 'summary', title?, recap: string[] }\`
  - \`outro\`: \`{ id, type: 'outro', title, text }\`
  - \`simulation\`: \`{ id, type: 'simulation', title, description, run: <function name> }\`
- Array length: aim for 8-12 slides. Start with \`intro\`, include 1-2 quick checks (\`quiz\` or \`true-false\`), include \`summary\` and \`outro\` at the end.
- Language: use very simple short sentences, analogies, step-by-step. Keep each bullet to one short sentence. 

SAFETY: Do not generate external network calls or non-deterministic code. Simulation code should only draw to the given \`canvas\` using 2D context and use \`requestAnimationFrame\` + return a cleanup that cancels it.

ADDITIONAL OUTPUT (JSON BACKUP):
- In addition to the JS/TS module, include a JSON-only backup of the slides between the markers \`/* SLIDES_JSON_START */\` and \`/* SLIDES_JSON_END */\` (exact markers). The JSON backup must be a valid JSON array that mirrors the exported slides  but uses a \`simulationCode\` string field (the function source) instead of function references. This JSON block is used by the server to parse safely.`
}

function buildUserPrompt(topic: string, hints ? : string) {
    const hintText = hints ? `Hints: ${hints}\n` : ''
    return `Topic: ${topic}\n${hintText}Return a single JavaScript/TypeScript module as described in the system prompt. The exported constant name must be SLIDES_<TOPIC_SLUG> where <TOPIC_SLUG> is the topic uppercased with non-alphanumeric replaced by underscore.  Use very simple language for 8th/9th graders. `
}

function buildFullPrompt(topic: string, hints ? : string) {
    return `${buildSystemPrompt()}\n\n${buildUserPrompt(topic, hints)}`
}

async function generateSlidesForTopic(topic: string, geminiApiKey:  string, hints?: string, opts:  GeminiOptions = {}): Promise<SlideData[]> {
    const full = buildFullPrompt(topic, hints);
    const { text } = await callGeminiRaw(full, geminiApiKey, opts);
    
    let parsed: any[] = [];
    
    // Try to extract JSON from the backup markers
    const jsonStartMarker = '/* SLIDES_JSON_START */';
    const jsonEndMarker = '/* SLIDES_JSON_END */';
    const startIdx = text.indexOf(jsonStartMarker);
    const endIdx = text.indexOf(jsonEndMarker);
    
    if (startIdx !== -1 && endIdx !== -1) {
        const jsonText = text.substring(startIdx + jsonStartMarker.length, endIdx).trim();
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
            console.error('Failed to parse JSON from markers:', e);
        }
    }
    
    // Fallback strategies if marker extraction failed
    if (! Array.isArray(parsed) || parsed.length === 0) {
        try {
            // Try parsing entire response
            parsed = JSON.parse(text);
        } catch {
            // Try to find array pattern
            const arrayMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
            if (arrayMatch) {
                try {
                    parsed = JSON.parse(arrayMatch[0]);
                } catch {
                    // Try to extract from export statement
                    const exportMatch = text.match(/export\s+const\s+SLIDES_\w+\s*=\s*(\[[\s\S]*?\]);?\s*(\? : \/\*|$)/);
                    if (exportMatch) {
                        try {
                            // Remove function references and convert to JSON-compatible format
                            const cleanedArray = exportMatch[1]
                                .replace(/run:\s*\w+/g, 'run: null') // Replace function refs with null
                                .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
                            parsed = eval(`(${cleanedArray})`); // Use eval carefully in controlled environment
                        } catch {
                            parsed = [];
                        }
                    }
                }
            }
        }
    }
        
    const slides = sanitizeSlides(parsed);
    console.log(`Generated ${slides.length} slides for topic "${topic}"`);
    return slides;
}

export interface OpenAIOptions {
    model?: string;
    temperature?: number;
}

async function callOpenAIRaw(topic: string, hints: string | undefined, openaiApiKey: string, opts: OpenAIOptions = {}) {
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY');
    const model = opts.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
        model,
        messages: [
            {
                role: 'system',
                content: buildSystemPrompt(),
            },
            {
                role: 'user',
                content: buildUserPrompt(topic, hints),
            },
        ],
        temperature: opts.temperature ?? 0.5,
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(`OpenAI API error: ${res.status} ${t}`);
    }

    const json: any = await res.json();
    const text = json?.choices?.[0]?.message?.content || '';
    return {
        raw: json,
        text,
    };
}

async function generateSlidesForTopicOpenAI(topic: string, openaiApiKey: string, hints?: string, opts: OpenAIOptions = {}): Promise<SlideData[]> {
    const { text } = await callOpenAIRaw(topic, hints, openaiApiKey, opts);
    let parsed: any[] = [];

    // Try to extract JSON from the backup markers
    const jsonStartMarker = '/* SLIDES_JSON_START */';
    const jsonEndMarker = '/* SLIDES_JSON_END */';
    const startIdx = text.indexOf(jsonStartMarker);
    const endIdx = text.indexOf(jsonEndMarker);

    if (startIdx !== -1 && endIdx !== -1) {
        const jsonText = text.substring(startIdx + jsonStartMarker.length, endIdx).trim();
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
            console.error('Failed to parse JSON from markers:', e);
        }
    }

    // Fallback strategies if marker extraction failed
    if (!Array.isArray(parsed) || parsed.length === 0) {
        try {
            const cleanText = text.replace(/```(?:json|javascript|typescript)?/gi, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleanText);
        } catch {
            const arrayMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
            if (arrayMatch) {
                try {
                    parsed = JSON.parse(arrayMatch[0]);
                } catch {
                    const exportMatch = text.match(/export\s+const\s+SLIDES_\w+\s*=\s*(\[[\s\S]*?\]);?\s*(\? : \/\*|$)/);
                    if (exportMatch) {
                        try {
                            const cleanedArray = exportMatch[1]
                                .replace(/run:\s*\w+/g, 'run: null')
                                .replace(/,(\s*[}\]])/g, '$1');
                            parsed = eval(`(${cleanedArray})`);
                        } catch {
                            parsed = [];
                        }
                    }
                }
            }
        }
    }

    const slides = sanitizeSlides(parsed);
    console.log(`Generated ${slides.length} slides for topic "${topic}" using OpenAI (${opts.model || process.env.OPENAI_MODEL || 'gpt-4o-mini'})`);
    return slides;
}

@Injectable()
export class GenerationService {
    private readonly openaiApiKey: string;
    private readonly geminiApiKey: string;

    constructor() {
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
        this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    }

    async generateSlides(userId: number, prompt: string, hints?: string) {
        try {
            if (!prompt || prompt.trim().length < 3) throw new BadRequestException('Prompt must be at least 3 characters');
            if (!this.openaiApiKey && !this.geminiApiKey) {
                throw new InternalServerErrorException('AI generation service is not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY.');
            }

            // Prioritize OpenAI if OPENAI_API_KEY is provided, otherwise fallback to Gemini
            let slides: SlideData[];
            if (this.openaiApiKey) {
                slides = await generateSlidesForTopicOpenAI(prompt, this.openaiApiKey, hints);
            } else {
                slides = await generateSlidesForTopic(prompt, this.geminiApiKey, hints, {
                    model: 'gemini-2.5-flash',
                });
            }

            return {
                slides,
                generatedAt: new Date().toISOString(),
                prompt,
                userId,
            };
        } catch (err: any) {
            if (err.message?.includes('OPENAI_API_KEY') || err.message?.includes('GEMINI_API_KEY')) {
                throw new InternalServerErrorException('AI generation service not configured');
            }
            if (err.message?.includes('OpenAI API error') || err.message?.includes('Gemini API error')) {
                throw new InternalServerErrorException(err.message);
            }
            if (err.getStatus?.() === 400) throw err;
            throw new InternalServerErrorException('Failed to generate slides');
        }
    }
}