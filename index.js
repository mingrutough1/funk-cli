#!/usr/bin/env node

const { program } = require('commander');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
const log = console.log;
const inquirer = require('inquirer');
const fs = require('fs');

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
        inquirer.prompt(promptList).then(res => {
            const {description, projectType, techType} = res;
            if(!description){ // description缺省值设置
                res.description = `a ${techType} ${projectType} project`;
            }
            
            // 检查当前目录是否存在
            try {
                fs.accessSync(`./${name}`, fs.constants.F_OK);
                const errStr = `fatal: destination path '${name}' already exists and is not an empty directory.`;
                log(chalk.red(errStr));
                return;
            } catch (err){
            }


            spinner.start();
            const downloadUrl = `direct:https://github.com/mingrutough1/project-init-templates.git#${techType}-${projectType}-template`;
            download(downloadUrl, `${name}`, { clone: true }, (err) => {
                if(err){
                    spinner.fail('拉去失败请稍后再试');
                    return;
                }
                spinner.succeed('模板下载成功');
            });
        })
       });

program.parse(process.argv);
process.exit = (code) => {
    console.log(`退出码: ${code}`);
  };