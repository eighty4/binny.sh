const options = @import("build_options");
const std = @import("std");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    const tcp_stream = makeTcpStream(allocator);
    defer tcp_stream.close();
    const n = try tcp_stream.write("hello from cli");
    std.debug.print("tcp conn to install.sh sent {d} bytes\n", .{n});
}

fn makeTcpStream(allocator: std.mem.Allocator) std.net.Stream {
    const address = std.net.Address.initIp4(options.install_sh_ip, options.install_sh_port);
    if (std.net.tcpConnectToAddress(allocator, address)) |tcp_stream| {
        return tcp_stream;
    } else |err| {
        std.debug.print("tcp conn to install.sh failed: {}\n", .{err});
        std.process.exit(1);
    }
}
