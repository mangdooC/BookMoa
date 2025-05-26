const fs = require('fs');
const path = require('path');

// 경로 설정: 프로젝트 내 data/comments.json 파일을 조작
const commentsFile = path.join(__dirname, '../data/comments.json');

// 댓글 파일에서 JSON 데이터를 읽어서 반환
function readComments() {
  return JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
}

// 댓글 데이터를 JSON 형식으로 파일에 저장
function writeComments(data) {
  fs.writeFileSync(commentsFile, JSON.stringify(data, null, 2));
}

// GET /comments/:postId
// 특정 게시글(postId)에 대한 모든 댓글을 조회
exports.getComments = (req, res) => {
  const postId = parseInt(req.params.postId); // URL 파라미터에서 게시글 ID 추출
  const comments = readComments().filter(c => c.postId === postId); // 해당 게시글의 댓글만 필터링
  res.json(comments); // 필터링된 댓글 목록 반환
};

// POST /comments/:postId
// 특정 게시글에 댓글을 추가
exports.addComment = (req, res) => {
  const postId = parseInt(req.params.postId); // URL 파라미터에서 게시글 ID 추출
  const { author, content } = req.body; // 요청 본문에서 작성자와 내용 추출
  const comments = readComments(); // 기존 댓글 불러오기

  // 새로운 댓글 객체 생성
  const newComment = {
    id: Date.now(), // 고유 ID를 위한 timestamp 사용
    postId, // 어떤 게시글에 속한 댓글인지 명시
    author,
    content,
    createdAt: new Date() // 댓글 작성 시간
  };

  comments.push(newComment); // 새 댓글을 배열에 추가
  writeComments(comments); // 업데이트된 배열을 파일에 저장
  res.status(201).json(newComment); // 생성된 댓글 반환
};