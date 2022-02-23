const path = require('path')
// fs-extra 是对 fs 模块的扩展，支持 promise 语法
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Generator = require('./Generator')
const ora = require('ora')

module.exports = async (name, options) => {
  // 执行创建命令

  // 当前命令行选择的目录
  const cwd = process.cwd()
  // 需要创建的目录地址
  const targetAir = path.join(cwd, name)
  

  // 目录是否已经存在？
  if (fs.existsSync(targetAir)) {
    // 是否为强制创建？
    if (options.force) {
      await fs.remove(targetAir)
    } else {
      // TODO：询问用户是否确定要覆盖
      let { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'Target directory already exists Pick an action:',
          choices: [
            {
              name: 'Overwrite',
              value: 'overwrite'
            },
            {
              name: 'Cancel',
              value: false
            }
          ]
        }
      ])
      
      if (action === 'overwrite') {
        // 移除已存在的目录
        console.log('\r');
        const spinner = ora(`${chalk.red(`Removing old dir...`)}`);
        spinner.start()
        await fs.remove(targetAir)
        spinner.succeed()
      }
    }
  } else {
  }


  // 创建项目
  const generator = new Generator(name, targetAir);

  // 开始创建项目
  generator.create()


}