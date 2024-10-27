package utils

var curr_id uint32 = 0

func GetId() uint32 {
	curr_id++
	return curr_id
}
