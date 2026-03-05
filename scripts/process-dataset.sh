#!/bin/bash

data_dir=""
out_file_path="../data/data-info.json"
json="["
#json_fmt=%s",\n"num_entries":%s,\n"entries":'
for dir in ../data/images/*/; do
  json_arr='['
  count=0
  for file in "$dir"*; do
    json_arr+='"'
    json_arr+="$file"
    json_arr+='",\n'
    ((count++))
  done
  json_arr="${json_arr:0:-3}]"
  json+='{\n"country":"'
  json+="$dir"
  json+='",\n"num_entries":'
  json+="$count"
  json+=',\n"entries":'
  json+="$json_arr},\n"
  #printf $json_arr
done
json="${json:0:-3}]"
printf "$json" > $out_file_path
