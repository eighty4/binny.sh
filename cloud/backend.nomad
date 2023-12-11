job "install.backend" {
  type = "service"

  group "install.backend" {
    count = 1

    task "install.backend" {
      driver = "docker"

      config {
        image = "84tech/install.backend:latest"

        auth {
          config = "/Users/adam/.docker/config.json"
        }
      }

      env {
      }
    }
  }

  update {
    max_parallel     = 1
    min_healthy_time = "5s"
    healthy_deadline = "3m"
    auto_revert      = false
    canary           = 0
  }
}
