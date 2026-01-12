#!/usr/bin/env sh

# builds each install.template.test.$os.$shell.$downloader image
#  and runs test for every combination of os, shell, downloader and gold test script

set -e
docker -l warn build -q --build-arg="INSTALL_DEPENDENCY=curl" -t install.template.test.debian.bash.curl -f gold/debian.bash.Dockerfile .
docker -l warn build -q --build-arg="INSTALL_DEPENDENCY=wget" -t install.template.test.debian.bash.wget -f gold/debian.bash.Dockerfile .
docker -l warn build -q --build-arg="INSTALL_DEPENDENCY=curl" -t install.template.test.debian.fish.curl -f gold/debian.fish.Dockerfile .
docker -l warn build -q --build-arg="INSTALL_DEPENDENCY=wget" -t install.template.test.debian.fish.wget -f gold/debian.fish.Dockerfile .
docker -l warn build -q --build-arg="INSTALL_DEPENDENCY=curl" -t install.template.test.debian.zsh.curl -f gold/debian.zsh.Dockerfile .
docker -l warn build -q --build-arg="INSTALL_DEPENDENCY=wget" -t install.template.test.debian.zsh.wget -f gold/debian.zsh.Dockerfile .
set +e

run_test() {
  image_suffix="$1"
  script="$2"
  binary="$3"
  shell_profile="$4"
  docker run -it --rm "install.template.test.$image_suffix" /gold/install_test.sh "$script" "$binary" "$shell_profile"
}

pass="\033[1;38;5;41m\0342\0234\0224\033[m"
fail="\033[41mx\033[m"

status_print() {
  exit_code="$1"
  label="$2"
  output="$3"
  if test "$exit_code" = 0; then
    echo " $pass $label"
  else
    echo " $fail $label"
    printf "   ---OUTPUT---\n   ------------\n%s\n   ------------\n\n" "$output"
  fi
}

shell_profile() {
  _shell="$1"
  case $_shell in
    bash)   _profile=".bash_profile" ;;
    fish)   _profile=".config/fish/config.fish" ;;
    zsh)    _profile=".zprofile" ;;
    *)      exit 1 ;;
  esac
  echo "$_profile"
}

binary_name() {
  _script="$1"
  case $_script in
    maestro.sh)    _binary="maestro" ;;
    *)             exit 1 ;;
  esac
  echo "$_binary"
}

oses="debian"
shells="bash fish zsh"
downloaders="curl wget"
scripts="maestro.sh"
result=0

for os in $oses; do
  for shell in $shells; do
    for downloader in $downloaders; do
      for script in $scripts; do
        output=$(run_test "$os.$shell.$downloader" "$script" "$(binary_name $script)" "$(shell_profile $shell)")
        status=$?
        status_print "$status" "$os $shell $downloader $script" "$output"
        if [ $status -ne "0" ]; then
          result=1
        fi
      done
    done
  done
done

exit $result
