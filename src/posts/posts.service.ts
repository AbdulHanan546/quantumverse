import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PostsService {
  private baseUrl = 'http://localhost:1337/api/posts';

  async getAllPosts() {
    const res = await axios.get(this.baseUrl);
    return res.data.data;
  }
}
