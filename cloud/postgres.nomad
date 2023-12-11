job "postgres" {
  type = "service"

  group "postgres" {
    count = 1

    task "postgres" {
      driver = "docker"

      config {
        image = "postgres:16"
      }

      env {
        POSTGRES_PASSWORD = eighty4
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
