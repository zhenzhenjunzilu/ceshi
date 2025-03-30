<?php
// 设置返回的内容类型为JSON
header('Content-Type: application/json');

// 定义图片所在目录
$imageDir = 'person/';

// 允许的图片扩展名
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

// 创建返回数组
$response = [
    'success' => false,
    'participants' => [],
    'debug' => []
];

// 检查目录是否存在
if (!is_dir($imageDir)) {
    $response['debug'][] = 'person文件夹不存在';
    $response['debug'][] = '当前工作目录: ' . getcwd();
    $response['debug'][] = '完整路径: ' . realpath($imageDir);
    echo json_encode($response);
    exit;
}

// 检查目录是否可读
if (!is_readable($imageDir)) {
    $response['debug'][] = 'person文件夹不可读，请检查权限';
    $response['debug'][] = '当前工作目录: ' . getcwd();
    $response['debug'][] = '完整路径: ' . realpath($imageDir);
    echo json_encode($response);
    exit;
}

// 获取person目录中的所有文件
$participants = [];
try {
    $files = scandir($imageDir);
    $response['debug'][] = '目录内容: ' . print_r($files, true);
    
    foreach ($files as $file) {
        // 跳过当前目录和上级目录
        if ($file == '.' || $file == '..') {
            continue;
        }
        
        $fullPath = $imageDir . $file;
        
        // 检查是否为文件且可读
        if (!is_file($fullPath) || !is_readable($fullPath)) {
            $response['debug'][] = "文件不可读: $fullPath";
            continue;
        }
        
        // 检查文件扩展名
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($extension, $allowedExtensions)) {
            // 从文件名中提取姓名（移除扩展名）
            $name = pathinfo($file, PATHINFO_FILENAME);
            
            // 处理可能的特殊字符（如下划线）
            $name = str_replace(['_', '-'], ' ', $name);
            
            $participants[] = [
                'name' => $name,
                'image' => $imageDir . $file
            ];
        }
    }
} catch (Exception $e) {
    $response['debug'][] = '发生异常: ' . $e->getMessage();
}

// 设置响应内容
$response['participants'] = $participants;
$response['count'] = count($participants);
$response['success'] = count($participants) > 0;

// 输出JSON格式的响应
echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
exit;
?> 