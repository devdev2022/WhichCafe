# 카페어디
https://cafeeodi.com

## 설명
사용자의 현재 위치를 중심으로 24시간 운영하는 카페의 위치를 보여주는 서비스 입니다. 

### 주요기능
- 사용자의 위치를 중심으로 직경 2km 이내에 있는 카페의 위치를 확인할 수 있습니다. 
- 주소 검색을 통해 자신이 갈 예정인 장소 근처의 카페정보를 확인할 수 있습니다. 
- 즐겨찾기를 통해 카페정보를 저장할 수 있습니다.

### 기술스택
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?&style=for-the-badge&logo=JavaScript&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?&style=for-the-badge&logo=TypeScript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933.svg?&style=for-the-badge&logo=Node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000.svg?&style=for-the-badge&logo=Express&logoColor=white)
<br>
![MYSQL](https://img.shields.io/badge/MYSQL-4479A1.svg?&style=for-the-badge&logo=MYSQL&logoColor=white)
<br>
![Docker](https://img.shields.io/badge/docker-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-2088FF.svg?style=for-the-badge&logo=githubactions&logoColor=white)
<br>
![EC2](https://img.shields.io/badge/Amazon%20EC2-FF9900?style=for-the-badge&logo=Amazon%20EC2&logoColor=white)
![RDS](https://img.shields.io/badge/S3-527FFF.svg?style=for-the-badge&logo=Amazon%20RDS&logoColor=white)
![S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=Amazon%20S3&logoColor=white)
![Cloud Watch](https://img.shields.io/badge/Amazon%20cloudwatch-FF4F8B?style=for-the-badge&logo=Amazon%20cloudwatch&logoColor=white)


## 아키텍처

### 어플리케이션 아키텍처
![Architecture_whichcafe](https://github.com/devdev2022/WhichCafe/blob/main/projectmaterial/Architecture.drawio.png)

<br>

### AWS 아키텍처
![DevOps_Architecture](https://github.com/devdev2022/WhichCafe/blob/main/projectmaterial/DevOps_Architecture.drawio.png)

<br>

### 시퀀스 
![Sequence_whichcafe](https://github.com/devdev2022/WhichCafe/blob/main/projectmaterial/Sequence.drawio.png)

<br>

### ERD
![ERD_whichcafe](https://github.com/devdev2022/WhichCafe/blob/main/projectmaterial/ERD.png)

<br>

## 기능 개선 
### 1. UUID 도입 및 요청속도 향상 

처음에는 Auto_increment를 사용했지만, 통신 과정에서 API 응답을 볼 수 있는 모든 사람들은 몇 개의 행이 생성되었는지 추측할 수 있다는 보안이슈를 고려하여 UUID v1으로 PK를 바꾸었다. 
하지만, 무턱대고 UUID를 char(36) 타입부터 사용하는 바람에 문자열의 길이가 길기 때문에 호출속도가 느려지는 문제가 발생했다. 
<br>그래서 UUID를 저장하는 방법에는 무엇이 있고, 특징과 장단점에 대해 조사 후, 각 방법에 대한 테스트를 진행하였다. 

#### 테스트 결과 

![PK Test](https://github.com/devdev2022/WhichCafe/blob/main/projectmaterial/PK%20TEST.png)

UUID에도 UUID v1과 UUID v4가 있었다. 하지만 이 중에서 어떤 것을 선택해야할지, 성능 테스트를 해보며 문제를 발견하고 문제의 원인을 파악하는 과정이 필요했었다. 
<br>그 결과, UUID v4는 테이블이 커질때 무작위로 생성되고, 어떤 순서나 구조도 가지지 않기 때문에 테이블의 여러 위치에 삽입될 수 있다는 문제를 알 수 있었다. 
<br>따라서 UUID v4s는 일반적으로 인덱싱 속도가 느려지므로 UUID v1을 선택했다. 

### 2. 비동기 요청 이슈 

Promise.allSettled() 객체를 이용하여 Google Place API에 데이터를 요청시 어떻게 하면 요청속도를 빠르게, 그리고 한번에 많은 양의 데이터를 요청하게 될때 요청이 처리되지 않는 문제를 해결할 수 있을지 요청 개수를 조절하며 테스트를 진행해 보았다. 

#### 테스트 결과 

![Request Test](https://github.com/devdev2022/WhichCafe/blob/main/projectmaterial/Request%20Test.png)

요청할 데이터 개수가 100개 이상인 경우, Socket connection timeout 에러가 발생했기 때문에 50개씩 나눠서 요청을 보내는 테스트 #2 방식으로 채택했었다.
<br>하지만 테스트 #1 환경에 Google Place API의 요청 평균 지연시간을 고려하여 요청 사이에 sleepTime을 추가하면 소켓 타임아웃 에러를 해결할 수 있을 것 같아서 시도해보았더니, 성공적으로 요청을 처리할 수 있다는 것을 확인할 수 있었다. 
<br>따라서 최종적으로는  테스트 #1 방식으로 요청 사이에 sleepTime을 추가하는 방법을 선택했다. 
