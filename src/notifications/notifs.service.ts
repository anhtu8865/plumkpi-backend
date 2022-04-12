import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/users/user.entity';

import { CustomNotFoundException } from 'src/utils/exception/NotFound.exception';
import { LessThanOrEqual, Like, Repository } from 'typeorm';
import { CreateNotifDto } from './dto/notif.dto';
import { Notif } from './notif.entity';
import Time from './time.entity';

@Injectable()
export default class NotifsService {
  constructor(
    @InjectRepository(Notif)
    private notifsRepository: Repository<Notif>,

    @InjectRepository(Time)
    private timesRepository: Repository<Time>,
  ) {}

  async createNotif(
    title: string,
    content: string,
    time: string,
    user_ids: number[],
  ) {
    const data = user_ids.map((user_id) => {
      return {
        title,
        content,
        time,
        user: { user_id },
      };
    });
    return this.notifsRepository.save(data);
  }

  // async createNotif(data: CreateNotifDto) {
  //   const { title, content, time, user_id } = data;
  //   return this.notifsRepository.save({
  //     title,
  //     content,
  //     time,
  //     user: { user_id },
  //   });
  // }

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

  async getNotifs(user: User, offset: number, limit: number, title: string) {
    const { time } = await this.getTime();
    const [items, count] = await this.notifsRepository.findAndCount({
      where: {
        user,
        time: LessThanOrEqual(time),
        title: Like(`%${title ? title : ''}%`),
      },
      order: { time: 'DESC' },
      skip: offset,
      take: limit,
    });
    return { items, count };
  }

  async getTime() {
    return this.timesRepository.findOne(1);
  }

  async updateTime(time: string) {
    return this.timesRepository.save({ time_id: 1, time });
  }
}
