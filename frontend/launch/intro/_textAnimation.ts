import type { Logo } from './calculations.js'

let zeroBuildCommand: HTMLElement | undefined

// todo animate individual spans for words, maybe diff algorithm for previous content and next content
function updateZeroBuildCommand(logo: Logo) {
    if (!zeroBuildCommand) {
        zeroBuildCommand = document.body.querySelector(
            '#intro-tl .compile.cmd',
        ) as HTMLElement
    }
    switch (logo) {
        case 'go':
            zeroBuildCommand.innerText = 'go build'
            break
        case 'linux':
            zeroBuildCommand.innerText = 'GOOS=linux GOARCH=amd64 go build'
            break
        case 'rust':
            zeroBuildCommand.innerText =
                'cargo build --target aarch64-unknown-linux-gnu'
            break
        case 'mac':
            zeroBuildCommand.innerText =
                'cargo build --target aarch64-apple-darwin'
            break
        case 'zig':
            zeroBuildCommand.innerText = 'zig build -Dtarget=aarch64-macos-none'
            break
        case 'win':
            zeroBuildCommand.innerText =
                'zig build -Dtarget=aarch64-windows-msvc'
            break
        case 'cpp':
            zeroBuildCommand.innerText = 'cmake --build aarch64-windows-msvc'
            break
    }
}
