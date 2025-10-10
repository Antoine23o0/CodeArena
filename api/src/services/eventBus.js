import EventEmitter from 'events';

export const EVENTS = {
  CONTEST_SCOREBOARD_UPDATED: 'scoreboard.contest.updated',
  GLOBAL_SCOREBOARD_UPDATED: 'scoreboard.global.updated',
};

const eventBus = new EventEmitter();

export default eventBus;

