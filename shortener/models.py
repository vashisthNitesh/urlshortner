from django.db import models


class Link(models.Model):
    slug = models.SlugField(unique=True)
    url = models.URLField()
    title = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title or self.slug
