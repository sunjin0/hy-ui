pipeline {
    agent any
    triggers { githubPush() }
    stages {
        // 获取代码
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --prefer-offline'
            }
        }

        stage('Build Production') {
            steps {
                sh 'npm run build'
                 // 存档构建产物
                 archiveArtifacts artifacts: 'build/**', fingerprint: true
            }
        }

        stage('Deploy to Nginx') {
            steps {
                sh 'echo "部署到 Nginx 服务器..."'
                sh 'cp -r build/* /var/www/html'
                sh 'echo "部署完成"'
            }
        }
    }

    post {
        success {
            script {
                step([$class: 'GitHubCommitStatusSetter',
                      contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: 'jenkins-ci'],
                      statusResultSource: [$class: 'ConditionalStatusResultSource', results: [[$class: 'AnyBuildResult', message: '测试环境发布成功', state: 'SUCCESS']]]])
            }
        }
        failure {
            script {
                step([$class: 'GitHubCommitStatusSetter',
                      contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: 'jenkins-ci'],
                      statusResultSource: [$class: 'ConditionalStatusResultSource', results: [[$class: 'AnyBuildResult', message: '测试环境发布失败', state: 'FAILURE']]]])
            }
        }
    }
}
