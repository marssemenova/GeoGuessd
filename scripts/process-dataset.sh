#!/bin/bash

data_dir="../data/"
out_file_path="../data/data-info.json"
json="["
for dir in "$data_dir"*/; do
  json_arr='['
  count=0
  for file in "$dir"*; do
    json_arr+='"'
    file_split=(${file//// })
    json_arr+="${file_split[-1]}"
    json_arr+='",\n\t\t'
    ((count++))
  done
  json_arr="${json_arr:0:-7}]"
  json+='{\n\t"country":"'
  dir_split=(${dir//// })
  json+="${dir_split[-1]}"
  json+='",\n\t"num_entries":'
  json+="$count"
  json+=',\n\t"entries":'
  json+="$json_arr\n},\n"
done
json="${json:0:-3}]"
printf "$json" > $out_file_path
