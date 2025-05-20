# antybariera_hugo

```
echo ".DS_Store \npublic/ \nresources/ \nresources/_gen/assets/" >> .gitignore
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/idarek/antybariera_hugo.git
git push -u origin main
```

## Backup
`git archive -o ../antybariera_hugo_{date}_{ver}.zip HEAD`

## Favicon GZIP

cp favicon.ico favicon_uncompressed.ico
gzip -k9 favicon.ico
mv favicon.ico.gz favicon.ico