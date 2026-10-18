variable "aws_region" {
  type    = string
  default = "ap-south-1"
}
variable "instance_type" {
  type    = string
  default = "t3.small"
}
variable "dockerhub_namespace" {
  type    = string
  default = "sammsulhoquechoudhary"
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9_-]+$", var.dockerhub_namespace))
    error_message = "Docker Hub namespace must use lowercase letters, numbers, underscores or hyphens."
  }
}
variable "image_tag" {
  type    = string
  default = "1.0.0"
  validation {
    condition     = can(regex("^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$", var.image_tag))
    error_message = "Image tag must be a valid Docker tag."
  }
}
