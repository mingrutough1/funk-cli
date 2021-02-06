#!/usr/bin/env node

const { program } = require('commander');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
const log = console.log;
const inquirer = require('inquirer');
const Handlebars = require("handlebars");
const fs = require('fs');
const execa = require('execa');

const promptList = [
    {
        name: 'description',
        message: '请输入项目描述'
    },
    {
        name: 'projectType',
        message: '请选择要初始化的项目类型',
        type: 'list',
        choices: [
            "pc",
            "h5"
        ],
    },
    {
        name: 'techType',
        message: '请选择技术栈',
        type: 'list',
        choices: [
            "vue",
            "react",
            "nodejs",
        ],
    }
];
const spinner = ora('奋力下载模板中...');


program.version('1.0.0');

// 自定义错误输出颜色
program
  .configureOutput({
    // Output errors in red.
    outputError: (str) => {
        log(chalk.red(str));
    }
  });

program.command('init <name>')
       .description('init a project')
       .action((name, opts) => {

        // 检查当前目录是否存在
        try {
            fs.accessSync(`./${name}`, fs.constants.F_OK);
            const errStr = `fatal: destination path '${name}' already exists and is not an empty directory.`;
            log(chalk.red(errStr));
            return;
        } catch (err){
        }

        inquirer.prompt(promptList).then(res => {
            const {description, projectType, techType} = res;
            if(!description){ // description缺省值设置
                res.description = `a ${techType} ${projectType} project`;
            }

            spinner.start();

            const downloadUrl = `direct:https://github.com/mingrutough1/project-init-templates.git#${techType}-${projectType}-template`;
            download(downloadUrl, `${name}`, { clone: true }, (err) => {
                if(err){
                    spinner.fail('拉去失败请稍后再试');
                    return;
                }
                spinner.succeed('模板下载成功');

                // 判断是否有package.json，有把用户cli输入数据回填至模板中
                try {
                    const path = `./${name}/package.json`;
                    fs.accessSync(path, fs.constants.F_OK);
                    const content = fs.readFileSync(path).toString();
                    const template = Handlebars.compile(content);

                    const result = template({
                        name,
                        description: res.description
                    });
                    fs.writeFileSync(path, result);
                    log(chalk.green('项目初始化成功！'));
                    spinner.start('开启依赖安装...');
                    // 初始化git git init
                    execa('git', ['init'], {
                        cwd: `./${name}`
                    }).then(res => {
                        log(res.stdout);
                    }).catch(err => {
                        log(err);
                    });
                    // 依赖安装 npm i
                    execa('npm', ['i'], {
                        cwd: `./${name}`
                    }).then(res => {
                        log(res.stdout);
                        spinner.succeed('依赖安装完成');
                    }).catch(err => {
                        spinner.fail('依赖安装失败，请手动安装');
                        log(err);
                    });
                } catch (err){
                    log(chalk.red('failed! 模板中不存在package.json'));
                }
            });
        })
       });

program.parse(process.argv);
process.exit = (code) => {
    console.log(`退出码: ${code}`);
  };