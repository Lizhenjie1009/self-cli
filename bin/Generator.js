
const { getRepoList, getTagList } = require('./http')
const ora = require('ora')
const inquirer = require('inquirer')
const path = require('path')
const chalk = require('chalk')
const util = require('util')
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
// 引入fs-extra软件包
var fsEx = require("fs-extra")
// 命令行工具
const cp = require('child_process')


// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();
  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result; 
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('Request failed, refetch ...')
  } 
}


class Generator {
  constructor (name, targetDir){
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;

    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }


  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称
  async getRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, 'waiting fetch template');
    if (!repoList) return;
    // 过滤我们需要的模板名称
    const repos = repoList.map(item => item.name);
    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: 'Please choose a template to create project'
    })
    // 3）return 用户选择的名称
    return repo;
  }


  // 获取用户选择的版本
  // 1）基于 repo 结果，远程拉取对应的 tag 列表
  // 2）用户选择自己需要下载的 tag
  // 3）return 用户选择的 tag
  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, 'waiting fetch tag', repo);
    if (!tags) return;
    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.name);
    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagsList,
      message: 'Place choose a tag to create project'
    })
    // 3）return 用户选择的 tag
    return tag
  }


  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  // 4）模板使用提示
  async create(){
    // // // 1）获取模板名称
    // const repo = await this.getRepo()

    // // 2) 获取 tag 名称
    // const tag = await this.getTag(repo)

    // // 3）下载模板到模板目录
    // await this.download(repo, tag)

    // 网络环境不稳定，复制文件
    await copy(this.name)

    // 4）模板使用提示
    console.log(`\r\n ${chalk.green(`Successfully created project ${chalk.cyan(this.name)}`)}\r\n`)

    const spinnerYl = ora(chalk.yellow('开始下载 node_modules 依赖'));
    spinnerYl.start()
    cp.exec('npm i', { cwd: path.join(process.cwd() + `/${this.name}`) }, (err, stdout, stderr) => {
      if (err){
        spinnerYl.fail(new Date(), chalk.red(' node_modules依赖下载失败，手动下载。'))
        console.log(err);
        console.log(`\r\n  ${chalk.cyan('    npm install')}\r\n\r\n`)
      } else {
        spinnerYl.succeed();
        console.log(stdout);
        console.warn(new Date(), chalk.green(' node_modules依赖下载成功'));

        console.log(`\r\n ${chalk.cyan('    cd ' + this.name)}`)
        console.log(`\r\n ${chalk.cyan('    npm run dev')}\r\n\r\n`)

        cp.exec(`cd ${this.name}`)
        // const spinnerBy = ora('开始编译');
        // spinnerBy.start()
        // cp.exec('npm run dev', { cwd: path.join(process.cwd() + `/${this.name}`) }, (err, stdout, stderr) => {
        //   if (err){
        //     // spinnerBy.fail(new Date(),' 项目编译失败')
        //     console.log(err);
        //   } else {
        //     // spinnerBy.succeed()
        //     console.log(stdout);
        //     console.warn(new Date(),' 项目编译成功');
        //   }
        // })
      }
    })
  }


  // 下载远程模板
  async download(repo, tag) {
    // 1）拼接下载地址
    const requestUrl = `lizhenjie/${repo}${tag?'#'+tag:''}`;
    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      'waiting download template', // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
  }

}

module.exports = Generator;

async function copy(name) {
  try {
    await fsEx.copy(path.join(__dirname + '/cli'), path.join(process.cwd() + '/' + name))
    // console.log('success',path.join(__dirname + '/pro'));
  } catch (error) {
    // console.log(error);
  }
}