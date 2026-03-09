#!/bin/bash

echo "=================================="
echo "🧪 MBTI 测试系统验证"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
PASSED=0
FAILED=0

# 测试函数
test_api() {
  local name="$1"
  local method="$2"
  local url="$3"
  local data="$4"

  echo -n "测试: $name ... "

  if [ "$method" = "POST" ]; then
    response=$(curl -X POST "$url" -H 'Content-Type: application/json' -d "$data" -s -w "\n%{http_code}")
  else
    response=$(curl -X GET "$url" -s -w "\n%{http_code}")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ 通过${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    echo "   响应: $(echo $body | jq -c . 2>/dev/null || echo $body | head -c 100)"
  else
    echo -e "${RED}❌ 失败${NC} (HTTP $http_code)"
    FAILED=$((FAILED + 1))
    echo "   错误: $(echo $body | head -c 200)"
  fi
  echo ""
}

# 1. 测试访问码验证（有效的访问码）
test_api "访问码验证 - 有效码" \
  "POST" \
  "http://localhost:3000/api/access/validate" \
  '{"code":"TEST-CODE-2024"}'

# 2. 测试访问码验证（无效的访问码）
test_api "访问码验证 - 无效码" \
  "POST" \
  "http://localhost:3000/api/access/validate" \
  '{"code":"INVALID-CODE-XXX"}'

# 3. 测试首页访问
echo -n "测试: 首页访问 ... "
response=$(curl -s -w "\n%{http_code}" http://localhost:3000/)
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ] || [ "$http_code" = "307" ]; then
  echo -e "${GREEN}✅ 通过${NC} (HTTP $http_code)"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ 失败${NC} (HTTP $http_code)"
  FAILED=$((FAILED + 1))
fi
echo ""

# 4. 测试访问码页面
test_api "访问码页面" \
  "GET" \
  "http://localhost:3000/access" \
  ""

# 5. 测试管理后台页面
test_api "管理后台页面" \
  "GET" \
  "http://localhost:3000/admin/codes" \
  ""

echo "=================================="
echo "📊 测试总结"
echo "=================================="
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo "总计: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 所有测试通过！系统运行正常！${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  部分测试失败，请检查错误信息${NC}"
  exit 1
fi
