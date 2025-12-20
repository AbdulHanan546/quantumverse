import { useParams } from "react-router-dom";
import { TOPIC_MAP } from "../content/data"
import { SimulationEngine } from "./SimulationEngine";
import { StoryEngine } from "./StoryEngine";
import TopicViewer from "./TopicRenderer";

export function TestTopic() {

    const { mode, number } = useParams<{ mode: 'sim' | 'slide' | 'story', number: string }>();

    if (!['sim', 'slide', 'story'].includes(mode as any) || !number) {
        return <div>Wrong Number</div>
    }

    const object = TOPIC_MAP[number];
    if (mode === 'sim') {
        return (
            <SimulationEngine simulation={object.lab} title={object.title} />
        )
    }
    if (mode === 'slide') {
        return (
            <TopicViewer slides={object.theory} title={object.title} />
        )
    }
    if (mode === 'story') {
        return (
            <StoryEngine onFinish={() => {}} script={object.story as any} title={object.title} />
        )
    }
}