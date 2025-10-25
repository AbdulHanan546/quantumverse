import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import QuantumSlide from "../components/QuantumSlide";

const topics = [
  { title: "Quantum Mechanics", description: "The behavior of matter and light." },
  { title: "Quantum Entanglement", description: "Spooky action at a distance." },
  { title: "Qubits", description: "The quantum version of classical bits." },
];

export default function Topics() {
  return (
    <Swiper spaceBetween={30} slidesPerView={1}>
      {topics.map((topic, i) => (
        <SwiperSlide key={i}>
          <QuantumSlide title={topic.title} description={topic.description} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
