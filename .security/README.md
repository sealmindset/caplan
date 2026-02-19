Changed to the files in this directory should be submitted as a pull request which the team in the `.github/CODEOWNERS` file will review.

### Excluding checks from `tfsec` 
To exclude certain checks from the `tfsec` results you can dd them to the `tfsec_config.json` file using the [tfsec config syntax](https://tfsec.dev/docs/config/).  Note the currently only the excluding of checks is supported, not the overriding of severities.

<details><summary>Example</summary>

```yaml
{
    "exclude": [ "azure-storage-allow-microsoft-service-bypass", "other-rules-in-the-list" ]
}
```

</details>
