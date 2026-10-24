pipeline{
    agent{
        label  "build-vm"
    }

    environment {
        IMAGE = 'fullstack-01-mongo-node-web'
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
        stage('Pusg to Docker Hub'){
            steps{
                withDockerRegistry( credentialsId: 'dockerhub-cred', url: ''){
                    sh """
                        docker push ${IMAGE}:${TAG}
                        docker tag ${IMAGE}:${TAG} ${IMAGE}:latest
                        docker push ${IMAGE}:latest
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