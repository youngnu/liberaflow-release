#!/usr/bin/env bash

set -euo pipefail

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$script_directory"

usage() {
  printf '%s\n' \
    "사용법: ./release.sh --check [--remote]" \
    "" \
    "이 도구는 릴리스 파일을 업로드하거나 Git 커밋·푸시를 실행하지 않습니다." \
    "R2 업로드와 메타데이터 수정을 마친 뒤 일관성만 검사합니다." >&2
}

fail() {
  printf '오류: %s\n' "$1" >&2
  exit 1
}

if [[ ${1:-} != "--check" || $# -gt 2 ]]; then
  usage
  exit 1
fi

check_remote=false
if [[ ${2:-} == "--remote" ]]; then
  check_remote=true
elif [[ $# -eq 2 ]]; then
  usage
  exit 1
fi

for command_name in node xmllint; do
  command -v "$command_name" >/dev/null 2>&1 ||
    fail "$command_name 명령을 찾을 수 없습니다."
done

download_config="assets/js/download-config.js"
appcast="updates/appcast.xml"
macos_url=$(sed -n "s/^[[:space:]]*macos:[[:space:]]*'\([^']*\)'.*/\1/p" "$download_config")
windows_url=$(sed -n "s/^[[:space:]]*windows:[[:space:]]*'\([^']*\)'.*/\1/p" "$download_config")

[[ -n "$macos_url" ]] || fail "macOS 다운로드 URL을 찾을 수 없습니다."
[[ -n "$windows_url" ]] || fail "Windows 다운로드 URL을 찾을 수 없습니다."

[[ "$macos_url" =~ ^https://downloads\.liberaflow\.com/Liberaflow-[0-9]+\.[0-9]+\.[0-9]+-macos\.dmg$ ]] ||
  fail "macOS URL이 R2 배포 규칙과 다릅니다: $macos_url"
[[ "$windows_url" =~ ^https://downloads\.liberaflow\.com/Liberaflow_[0-9]+\.[0-9]+\.[0-9]+_Setup\.exe$ ]] ||
  fail "Windows URL이 R2 배포 규칙과 다릅니다: $windows_url"

macos_version=${macos_url#https://downloads.liberaflow.com/Liberaflow-}
macos_version=${macos_version%-macos.dmg}
windows_version=${windows_url#https://downloads.liberaflow.com/Liberaflow_}
windows_version=${windows_version%_Setup.exe}

for page in index.html docs.html; do
  [[ $(grep -Foc "href=\"$macos_url\"" "$page" || true) -eq 1 ]] ||
    fail "${page}의 macOS 직접 다운로드 링크가 중앙 설정과 다릅니다."
  [[ $(grep -Foc "href=\"$windows_url\"" "$page" || true) -eq 1 ]] ||
    fail "${page}의 Windows 직접 다운로드 링크가 중앙 설정과 다릅니다."
done

[[ $(grep -Foc "url=\"$macos_url\"" "$appcast" || true) -eq 1 ]] ||
  fail "appcast의 macOS URL이 중앙 설정과 다릅니다."
[[ $(grep -Foc "url=\"$windows_url\"" "$appcast" || true) -eq 1 ]] ||
  fail "appcast의 Windows URL이 중앙 설정과 다릅니다."

xmllint --noout "$appcast"

macos_title=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$macos_url']/../*[local-name()='title'])" "$appcast")
macos_appcast_version=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$macos_url']/../*[local-name()='version'])" "$appcast")
macos_short_version=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$macos_url']/../*[local-name()='shortVersionString'])" "$appcast")
macos_pub_date=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$macos_url']/../*[local-name()='pubDate'])" "$appcast")
macos_length=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$macos_url']/@length)" "$appcast")
macos_type=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$macos_url']/@type)" "$appcast")
macos_os=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$macos_url']/@*[local-name()='os'])" "$appcast")
macos_signature=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$macos_url']/@*[local-name()='edSignature'])" "$appcast")

windows_title=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$windows_url']/../*[local-name()='title'])" "$appcast")
windows_pub_date=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$windows_url']/../*[local-name()='pubDate'])" "$appcast")
windows_appcast_version=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$windows_url']/@*[local-name()='version'])" "$appcast")
windows_length=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$windows_url']/@length)" "$appcast")
windows_type=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$windows_url']/@type)" "$appcast")
windows_os=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$windows_url']/@*[local-name()='os'])" "$appcast")
windows_signature=$(xmllint --xpath "string(//*[local-name()='enclosure'][@url='$windows_url']/@*[local-name()='dsaSignature'])" "$appcast")

[[ "$macos_title" == "Version $macos_version" ]] ||
  fail "appcast의 macOS 제목과 URL 버전이 다릅니다."
[[ "$macos_appcast_version" == "$macos_version" ]] ||
  fail "appcast의 macOS 버전과 URL 버전이 다릅니다."
[[ "$macos_short_version" == "$macos_version" ]] ||
  fail "appcast의 macOS 표시 버전과 URL 버전이 다릅니다."
[[ "$windows_title" == "Version $windows_version" ]] ||
  fail "appcast의 Windows 제목과 URL 버전이 다릅니다."
[[ "$windows_appcast_version" == "$windows_version" ]] ||
  fail "appcast의 Windows 버전과 URL 버전이 다릅니다."
[[ "$macos_type" == "application/x-apple-diskimage" && "$macos_os" == "macos" ]] ||
  fail "appcast의 macOS 파일 유형 또는 운영체제 값이 잘못되었습니다."
[[ "$windows_type" == "application/octet-stream" && "$windows_os" == "windows" ]] ||
  fail "appcast의 Windows 파일 유형 또는 운영체제 값이 잘못되었습니다."

rfc822_utc_pattern='^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12][0-9]|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-9]{4} (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9] \+0000$'
[[ "$macos_pub_date" =~ $rfc822_utc_pattern ]] ||
  fail "appcast의 macOS pubDate가 RFC 822 UTC 형식이 아닙니다."
[[ "$windows_pub_date" =~ $rfc822_utc_pattern ]] ||
  fail "appcast의 Windows pubDate가 RFC 822 UTC 형식이 아닙니다."

[[ "$macos_length" =~ ^[1-9][0-9]*$ ]] ||
  fail "appcast의 macOS length가 유효한 바이트 수가 아닙니다."
[[ "$windows_length" =~ ^[1-9][0-9]*$ ]] ||
  fail "appcast의 Windows length가 유효한 바이트 수가 아닙니다."
[[ "$macos_signature" =~ ^[A-Za-z0-9+/]{20,}={0,2}$ ]] ||
  fail "appcast의 macOS 업데이트 서명이 없거나 형식이 잘못되었습니다."
[[ "$windows_signature" =~ ^[A-Za-z0-9+/]{20,}={0,2}$ ]] ||
  fail "appcast의 Windows 업데이트 서명이 없거나 형식이 잘못되었습니다."

for script_file in assets/js/*.js; do
  node --check "$script_file" >/dev/null
done

if [[ "$check_remote" == true ]]; then
  command -v curl >/dev/null 2>&1 || fail "curl 명령을 찾을 수 없습니다."
  for download_spec in "$macos_url|$macos_length" "$windows_url|$windows_length"; do
    download_url=${download_spec%|*}
    expected_length=${download_spec##*|}
    response_headers=$(curl --fail --silent --show-error --location --head --max-time 30 \
      "$download_url") || fail "다운로드 URL을 열 수 없습니다: $download_url"
    remote_length=$(printf '%s\n' "$response_headers" | tr -d '\r' | \
      awk 'tolower($1) == "content-length:" { value=$2 } END { print value }')
    [[ "$remote_length" == "$expected_length" ]] ||
      fail "appcast length와 원격 파일 크기가 다릅니다: $download_url"
  done
fi

printf '%s\n' "릴리스 메타데이터 검사가 통과했습니다."
