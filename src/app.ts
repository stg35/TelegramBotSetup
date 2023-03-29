import { Telegraf } from 'telegraf';
import { IConfigService } from './config/config.interface';
import { ConfigService } from './config/config.service';
import { IBotContext } from './context/context.interface';
import { Command } from './commands/command.class';
import { StartCommand } from './commands/start.command';
import RedisSession from 'telegraf-session-redis';

class Bot {
  bot: Telegraf<IBotContext>;
  commands: Command[] = [];

  constructor(private readonly configService: IConfigService) {
    this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));
    this.bot.use(
      new RedisSession({
        store: {
          host: this.configService.get('DB_HOST'),
          port: this.configService.get('DB_PORT'),
        },
      })
    );
  }

  init() {
    this.commands = [new StartCommand(this.bot)];
    for (const command of this.commands) {
      command.handle();
    }

    this.bot.launch();
  }
}

const bot = new Bot(new ConfigService());
bot.init();
