import TopicRenderer from "./components/TopicRenderer";
import { dummyTopic } from "./data/dummyTopic";
import "./index.css"
export default function App() {
  return (
    <div className="w-full h-screen bg-black">
      <TopicRenderer components={dummyTopic} />
    </div>
  );
}
