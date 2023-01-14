import pprint


stuffs = {
    'fruits': ['apple', 'banana', 'cherry'],
    'bananas': ['banana1', 'banana2', 'banana3']
}

#pprint.pprint(stuffs['fruits'][1])


# map の第1引数は callback 関数
banana_love_only = list(map(lambda banana: banana + ' love', stuffs['bananas']))

for iter in banana_love_only:
    print (iter)


# convert the map into a list, for readability:
# print(list(x))
