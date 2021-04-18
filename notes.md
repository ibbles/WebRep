```
db.recipelist.insert({'recipename': 'Meep', 'ingredients': [{'amount': 2.5, 'unit': 'msk', 'name': 'kärlek', 'specification': 'kravlös'},{'amount': 1, 'unit': 'kg', 'name': 'tålamod', 'specification': ''}]})
WriteResult({ "nInserted" : 1 })
```

```
db.recipelist.drop()
```

```
db.recipelist.find({}).pretty()
```
