import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

import Utils from './utils/utils';

const app = express();
const prisma = new PrismaClient({
  log: ['query'],
});

app.use(express.json());
app.use(cors());

app.get('/games', async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return response.json(games);
});

app.post('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;
  const body: any = request.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      weekDays: body.weekDays.join(','),
      hourStart: Utils.convertHourToMinutos(body.hourStart),
      hourEnd: Utils.convertHourToMinutos(body.hourEnd),
      yearsPlaying: body.yearsPlaying,
      useVoiceChannel: body.useVoiceChannel,
      discord: body.discord,
    },
  });

  return response.status(201).json(ad);
});

app.get('/ads', async (request, response) => {
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      hourStart: true,
      hourEnd: true,
      yearsPlaying: true,
      useVoiceChannel: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  response.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(','),
      };
    })
  );
});

app.get('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      hourStart: true,
      hourEnd: true,
      yearsPlaying: true,
      useVoiceChannel: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  response.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(','),
        hourStart: Utils.convertMinutesToHours(ad.hourStart),
        hourEnd: Utils.convertMinutesToHours(ad.hourEnd),
      };
    })
  );
});

app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  return response.json({
    discord: ad.discord,
  });
});

app.listen(3333);
