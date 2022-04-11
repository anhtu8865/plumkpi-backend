import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/users/user.entity';
import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { Repository } from 'typeorm';
import { CreateNotifDto } from './dto/notif.dto';
import { Notif } from './notif.entity';

@Injectable()
export default class NotifsService {
  constructor(
    @InjectRepository(Notif)
    private notifsRepository: Repository<Notif>,
  ) {}

  async createNotif(data: CreateNotifDto) {
    const { title, content, time, user_id } = data;
    return this.notifsRepository.save({
      title,
      content,
      time,
      user: { user_id },
    });
  }

  async getNotifById(notif_id: number) {
    const notif = await this.notifsRepository.findOne(notif_id);
    if (notif) {
      return notif;
    }
    throw new CustomNotFoundException(
      `Không tìm thấy thống báo id ${notif_id}`,
    );
  }

  async markedAsRead(notif_id: number) {
    const notif = await this.getNotifById(notif_id);
    notif.is_read = true;
    return this.notifsRepository.save(notif);
  }

  async getNotifs(user: User) {
    return this.notifsRepository.find({ user });
  }
}
