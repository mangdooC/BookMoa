const fs = require('fs');
const path = require('path');
// posts.json 파일의 경로를 설정합니다.
const postsFile = path.join(__dirname, '../data/posts.json');

/**
 * 게시글 전체 목록을 가져오는 함수 (GET /posts)
 * 파일에서 게시글 목록을 읽어와 클라이언트에게 반환합니다.
 */
exports.getAllPosts = (req, res) => {
  // posts.json 파일에서 데이터를 동기적으로 읽어와 파싱합니다.
  const data = JSON.parse(fs.readFileSync(postsFile));
  // 클라이언트에게 게시글 전체 목록을 JSON 형식으로 응답합니다.
  // 즉, 저장된 모든 게시글의 배열을 반환합니다.
  res.json(data); // 전체 게시글 목록 반환
};

/**
 * 새 게시글을 생성하는 함수 (POST /posts)
 * 요청의 본문에서 제목과 내용을 받아 새 게시글을 생성하고 저장합니다.
 */
exports.createPost = (req, res) => {
  // 요청 본문에서 title과 content를 추출합니다.
  const { title, content } = req.body;
  // 기존 게시글 목록을 파일에서 읽어옵니다.
  const data = JSON.parse(fs.readFileSync(postsFile));
  // 새 게시글 객체를 생성합니다.
  const newPost = {
    id: Date.now(), // 고유한 ID로 현재 타임스탬프를 사용합니다.
    title,
    content,
    createdAt: new Date() // 생성 시각을 저장합니다.
  };
  // 새 게시글을 목록에 추가합니다.
  data.push(newPost);
  // 변경된 게시글 목록을 파일에 저장합니다.
  fs.writeFileSync(postsFile, JSON.stringify(data, null, 2));
  // 생성된 게시글을 클라이언트에게 반환합니다.
  res.status(201).json(newPost);
};

/**
 * 특정 ID의 게시글을 조회하는 함수 (GET /posts/:id)
 * 요청 파라미터의 id에 해당하는 게시글을 찾아 반환합니다.
 */
exports.getPostById = (req, res) => {
  // 게시글 목록을 파일에서 읽어옵니다.
  const data = JSON.parse(fs.readFileSync(postsFile));
  // 요청된 id와 일치하는 게시글을 찾습니다.
  const post = data.find(p => p.id === parseInt(req.params.id));
  // 게시글이 없으면 404 에러를 반환합니다.
  if (!post) return res.status(404).json({ error: 'Post not found' });
  // 게시글이 있으면 해당 게시글을 반환합니다.
  res.json(post);
};

/**
 * 게시글을 수정하는 함수 (PUT /posts/:id)
 * 해당 ID의 게시글을 찾아 요청 본문의 내용으로 수정합니다.
 */
exports.updatePost = (req, res) => {
  // 게시글 목록을 파일에서 읽어옵니다.
  const data = JSON.parse(fs.readFileSync(postsFile));
  // 수정할 게시글의 인덱스를 찾습니다.
  const index = data.findIndex(p => p.id === parseInt(req.params.id));
  // 게시글이 없으면 404 에러를 반환합니다.
  if (index === -1) return res.status(404).json({ error: 'Post not found' });
  // 기존 게시글 내용에 새 요청 내용을 병합하고, 수정 시각을 기록합니다.
  data[index] = { ...data[index], ...req.body, updatedAt: new Date() };
  // 변경된 게시글 목록을 파일에 저장합니다.
  fs.writeFileSync(postsFile, JSON.stringify(data, null, 2));
  // 수정된 게시글을 반환합니다.
  res.json(data[index]);
};

/**
 * 게시글을 삭제하는 함수 (DELETE /posts/:id)
 * 해당 ID의 게시글을 목록에서 삭제하고 저장합니다.
 */
exports.deletePost = (req, res) => {
  // 게시글 목록을 파일에서 읽어옵니다.
  const data = JSON.parse(fs.readFileSync(postsFile));
  // 삭제할 게시글을 제외한 새로운 목록을 만듭니다.
  const filtered = data.filter(p => p.id !== parseInt(req.params.id));
  // 삭제할 게시글이 없으면 404 에러를 반환합니다.
  if (data.length === filtered.length) return res.status(404).json({ error: 'Post not found' });
  // 변경된 게시글 목록을 파일에 저장합니다.
  fs.writeFileSync(postsFile, JSON.stringify(filtered, null, 2));
  // 삭제 성공 시 204 No Content 상태로 응답합니다.
  res.status(204).send();
};