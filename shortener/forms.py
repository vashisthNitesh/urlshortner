from django import forms
from .models import Link


class LinkForm(forms.ModelForm):
    class Meta:
        model = Link
        fields = ["url", "slug", "title"]
        widgets = {
            "url": forms.URLInput(attrs={"placeholder": "Destination URL"}),
            "slug": forms.TextInput(attrs={"placeholder": "Custom slug"}),
            "title": forms.TextInput(attrs={"placeholder": "Title (optional)"}),
        }
