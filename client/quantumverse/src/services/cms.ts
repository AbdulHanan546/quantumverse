import axios from "axios";

export async function fetchTopic(slug: string) {
  const { data } = await axios.get(`https://your-strapi-instance/api/topics/${slug}?populate=*`);
  return data;
}
