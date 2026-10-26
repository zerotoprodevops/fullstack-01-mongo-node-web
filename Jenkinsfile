pipeline{
    agent{
        label  "build-vm"
    }

    environment {
        IMAGE = 'jyotimanab/fullstack-01-mongo-node-web'
        TAG = "${env.BUILD_NUMBER}"
    }
    stages{
        stage('git checkout'){
            steps{
                git branch: 'main',
                    url: 'https://github.com/zerotoprodevops/fullstack-01-mongo-node-web.git'
            }
        }
        stage('Build'){
            steps{
                sh "docker build -t ${IMAGE}:${TAG} ."
            }
        }
        stage('Test'){
            steps{
                sh "TMPDIR=/tempdir trivy image ${IMAGE}:${TAG}"
            }
        }
        stage('Push to Docker Hub'){
            steps{
                withDockerRegistry(credentialsId: 'dockerhub-cred', url: ''){
                    sh """
                        docker push ${IMAGE}:${TAG}
                        docker tag ${IMAGE}:${TAG} ${IMAGE}:latest
                        docker push ${IMAGE}:latest
                       """
                }
            }
        }
        stage('Update Gitops Manifest'){
            steps{
                withCredentials([usernamePassword(credentialsId: 'github-token', passwordVariable: 'GIT_PASS', usernameVariable: 'GIT_USER')])   {
                    sh """
                    #1. clone the config repo
                    rm -rf fullstack-01-gitops-configs
                    git clone https://${GIT_USER}:${GIT_PASS}@github.com/zerotoprodevops/fullstack-01-gitops-configs.git
                    cd fullstack-01-gitops-configs
                    
                    #2.Update the IMAGE TAG in the web values.yaml
                    sed -i "s|  tag: .*|  tag: \\"${TAG}\\"|g" web-chart/values.yaml
                    
                    #3. Commit and push
                    git config user.email "jenkins@k8cluster.local"
                    git config user.name "Jenkins CI"
                    git add .
                    git commit -m "Update Web image tag to ${TAG} [skip ci]"
                    git push origin main
                    """
                }
            }
        }
    }
    post{
        success {
            echo "Build ${TAG} Successful - Image on Docker Hub"
            sh "docker rmi ${IMAGE}:${TAG} ${IMAGE}:latest || echo 'cleanup: Image not found locally'"
        }
        failure{
            echo 'Pipelin Failed:  Image kept locally for debugging'
        }
    }
    
}