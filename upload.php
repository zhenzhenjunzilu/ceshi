<?php
// 设置响应头
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 定义上传目录
$uploadDir = 'person/';

// 创建上传目录（如果不存在）
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// 初始化响应数组
$response = [
    'success' => false,
    'error' => '',
    'field' => ''
];

// 验证姓名
if (!isset($_POST['name']) || empty(trim($_POST['name']))) {
    $response['error'] = '请输入您的姓名';
    $response['field'] = 'name';
    echo json_encode($response);
    exit;
}

// 清理并验证姓名（仅保留中文、英文字母和空格）
$name = preg_replace('/[^\p{L}\p{Han}\s]/u', '', trim($_POST['name']));
if (empty($name)) {
    $response['error'] = '姓名包含无效字符';
    $response['field'] = 'name';
    echo json_encode($response);
    exit;
}

// 验证文件上传
if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    $response['error'] = '请选择一张照片';
    $response['field'] = 'photo';
    echo json_encode($response);
    exit;
}

// 验证文件类型
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$fileType = $_FILES['photo']['type'];
if (!in_array($fileType, $allowedTypes)) {
    $response['error'] = '请选择有效的图片文件 (JPG, PNG, GIF)';
    $response['field'] = 'photo';
    echo json_encode($response);
    exit;
}

// 验证文件大小（最大5MB）
$maxFileSize = 5 * 1024 * 1024; // 5MB
if ($_FILES['photo']['size'] > $maxFileSize) {
    $response['error'] = '照片大小不能超过5MB';
    $response['field'] = 'photo';
    echo json_encode($response);
    exit;
}

// 生成唯一的文件名（使用姓名）
$fileName = $name . '.jpg';
$uploadPath = $uploadDir . $fileName;

// 尝试转换并保存图片为JPG
try {
    // 根据文件类型读取图像
    switch ($fileType) {
        case 'image/jpeg':
            $sourceImage = imagecreatefromjpeg($_FILES['photo']['tmp_name']);
            break;
        case 'image/png':
            $sourceImage = imagecreatefrompng($_FILES['photo']['tmp_name']);
            break;
        case 'image/gif':
            $sourceImage = imagecreatefromgif($_FILES['photo']['tmp_name']);
            break;
        default:
            throw new Exception('不支持的图像类型');
    }

    // 创建新的JPG图像
    $result = imagejpeg($sourceImage, $uploadPath, 85); // 85是压缩质量
    imagedestroy($sourceImage);

    if (!$result) {
        throw new Exception('保存图像失败');
    }

    // 设置成功响应
    $response['success'] = true;
    echo json_encode($response);
} catch (Exception $e) {
    $response['error'] = '图像处理失败：' . $e->getMessage();
    echo json_encode($response);
}
exit;
?> 