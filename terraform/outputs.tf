output "frontend_url" {
  value = "http://${aws_instance.app.public_ip}"
}
output "public_ip" {
  value = aws_instance.app.public_ip
}
output "public_dns" {
  value = aws_instance.app.public_dns
}
output "instance_id" {
  value = aws_instance.app.id
}
output "private_ip" {
  value = aws_instance.app.private_ip
}
output "ssm_command" {
  value = "aws ssm start-session --region ${var.aws_region} --target ${aws_instance.app.id}"
}
