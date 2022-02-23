#! /usr/bin/env node

const program = require("commander")
const chalk = require("chalk")
const figlet = require("figlet")

// 定义命令和参数
program
  .command('create <project-name>')       
  .description('create a new project')    
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
    require('../bin/create')(name, options)
  })


// 配置config命令
program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>')
  .option('-d, --delete <path>', 'delete option from config')
  .action((value, options) => {
    console.log(value, options, 'config');
  })


// 配置ui命令
program
  .command('ui')
  .description('start add open lhcz-cli ui')
  .option('-p, --port <port>', 'Port used for the UI Server')
  .action(options => {
    console.log(options, 'ui');
  })


// 配置版本号信息
program
  .version(`v${require('../package.json').version}`)
  .usage('<command> [option]')

// 颜色提示
program
  .on('--help', _ => console.log(`\r\nRun ${chalk.cyan(`lhcz <command> --help`)} for detailed usage of given command\r\n`))


// logo
program
  .on('--help', _ => {
    // 使用 figlet 绘制 Logo
    console.log(`\r\n ${chalk.red(figlet.textSync('lhcz', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    }))}`);

    // 新增说明信息
    console.log(`\r\nRun ${chalk.cyan(`lhcz <command> --help`)} show details\r\n`);
  })

// 解析用户执行命令传入参数
program.parse(process.argv)