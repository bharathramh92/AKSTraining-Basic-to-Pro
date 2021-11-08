# AKS HOL - Advanced to Pro

## Introduction

## Purpose

## Pre-Requisites

![AKS-Ref-Achitecture-v2.2](./Assets/AKS-Ref-Achitecture-v2.2.png)

- Gone thru the exercises of Basic to Advanced

- AKS cluster already created

- 3 Namespaces created

  - aks-workshop-dev
  - aks-workshop-qa
  - smoke

- Applications Deployed
  - Ratings App (DEV and QA)
  - Nginx App (Smoke)

- Nginx Ingress Controller deployed; with Private IP

- API routing is happening thru K8s Ingress rules

- Network Policies deployed for East-West traffic
  - Successfully Tested with various configurations

- Monitoring enabled
  - Azure Monitor
  - Log Analytics
  - Grafana (Integrated with Azure Monitor)

- End to End connectivity established
  - Application Gateway as Public facing L7 LoadBalancer
  - Multi-Tenancy implemnented tru Application Gateway Listeners and Http Settings

- Load Testing
  - JMeter Local

  - JMX files created for RatingsApi app 

  - HPA for RatingsApi enabled

  - Successfully Tested with Load

    

## HOL

- **Local Variables**

  ```bash
  baseFolderPath=""
  setupFolderPath="$baseFolderPath/Setup"
  microservicesFolderPath="$baseFolderPath/Microservices"
  tenantId=""
  subscriptionId=""
  aksResourceGroup=""
  masterResourceGroup=""
  location=""
  clusterName=""
  version=""
  acrName=""
  acrId=
  keyVaultName=""
  keyvaultId=
  objectId=
  masterVnetName=""
  masterVnetPrefix=""
  masterVnetId=
  masterSubnetName=""
  masterSubnetPrefix=""
  masterSubnetId=
  aksVnetName=""
  aksVnetPrefix=""
  aksVnetId=
  aksSubnetName=""
  aksSubnetPrefix=""
  aksSubnetId=
  aksIngressSubnetName=""
  aksIngressSubnetPrefix=""
  aksIngressSubnetId=
  appgwName=""
  appgwSubnetName=""
  appgwSubnetPrefix=""
  appgwSubnetId=
  apimName=""
  apimSubnetName=""
  apimSubnetPrefix=""
  apimSubnetId=
  sysPoolName=akssyspool
  sysPoolNodeSize="Standard_DS3_v2"
  sysPoolNodeCount=3
  sysPoolMaxPods=30
  sysPoolMaxNodeCount=5
  apiPoolName=aksapipool
  apiPoolNodeSize="Standard_DS3_v2"
  apiPoolNodeCount=3
  apiPoolMaxPods=30
  apiPoolMaxNodeCount=10
  networkPlugin=azure
  networkPolicy=azure
  vmSetType=VirtualMachineScaleSets
  addons=monitoring
  aadAdminGroupID=""
  aadTenantID=""
  spAppId=""
  spPassword=""
  masterAKSPeering="$masterVnetName-$aksVnetName-peering"
  aksMasterPeering="$aksVnetName-$masterVnetName-peering"
  masterAKSPrivateDNSLink="$masterVnetName-aks-dns-link"
  aksPrivateDNSLink="$aksVnetName-dns-link"
  aksIngControllerName=""
  aksIngControllerNSName=""
  aksIngControllerFileName="internal-ingress"
  privateDNSZoneName=""
  privateDNSZoneId=
  httpsListenerNames='("dev","qa")'
  backendIpAddress=
  aadAdminGroupIDs='("")'
  aadTenantID=""
  ```

- **Login to Azure**

  ```bash
  az login --tenant $tenantId
  
  #Check Selected Subscription
  az account show
  
  #Set appropriate Subscription, if needed
  #az account set -s $subscriptionId
  ```

- **API Management**

  ![apim-short-view](./Assets/apim-short-view.png)

  - Install API Management through Azure Portal

  - Move APIM into a Subnet (already created in previous exercise)
    - A private IP is assigned to APIM instance

  - A Custom Domian for APIM is configured
    - Using a proper DNS certificate
    - LetsEncrypt Certificates can also be used

  - Modify Application Gateway backend pool to point to this Private IP
    (Earlier it was pointing to Private IP of Nginx Ingress)

    - Modify Http Settings of Application Gateway to point all traffic to APIM
    - Modify Health Probe accordingly
    - Define APIs behind APIM
    - Check end-to-end connectivity

  - Configure OAuth for APIM
    - Configure APIs with OAuth definition
    - Add Policies for JWT header validation
    - Authenticate Each API
    - Generate Bearer Token by making a call to Azure AD Graph API (POSTMAN or any REST client can be used)
    - Pass this Token with the Authorization header of each API call
    - APIM policies should allow/reject API calls accordingly

  - Check end-to-end connectivity

  - Enable Application Insights in APIM

  - Check Metrics in Azure Portal

    

- **KEDA**

  ```bash
  #Kubernetes based Event Driven AutoScaling - Severless, Event Driven Apps
  
  Refer Here - https://keda.sh/docs/2.4/deploy/
  
  #Add Helm repo
  helm repo add kedacore https://kedacore.github.io/charts
  
  #Update Helm repo
  helm repo update
  
  #Install keda Helm chart
  kubectl create namespace keda
  helm install keda kedacore/keda --namespace keda
  
  #Create Namespace for Serverless apps
  kubectl create ns serverless
  
  #Create a Storage Account in Azure Portal - kedateststg
  #Create a Blob Container in Azure Portal - kedablob
  #Create a Queue Container in Azure Portal - kedaqueue
  
  #Note down the Connection String of the storage account
  #This would be added as K8s secret inside the AKS cluster
  kubetcl create secret generic keda-stg-secret -n serverless --from-literal=AzureWebJobsStorage="<Blob-Connection-String>"
  
  ================================================================================
  
  #ACIBlobApp
  ================================================================================
  #Deploy ACIBlobApp in serverless namespace
  #App reacts to Blob events
  helm install aciblobapp-chart -n serverless $microservicesFolderPath/Helms/aciblobapp-chart/ -f $microservicesFolderPath/Helms/aciblobapp-chart/AKSWorkshop/values-dev.yaml
  
  #helm upgrade aciblobapp-chart -n serverless $microservicesFolderPath/Helms/aciblobapp-chart/ -f $microservicesFolderPath/Helms/aciblobapp-chart/AKSWorkshop/values-dev.yaml
  #helm uninstall aciblobapp-chart -n serverless
  
  #Check if app is deployed and no. of replicas running
  kubectl get all -n serverless
  
  #Modify the values-dev.yaml file to update placeholder values
  
  #Deploy KEDA objects in serverless namespace
  #These objects would ensure that the application scales based on Blob trigger
  helm install aciblobapp-chart -n serverless $microservicesFolderPath/Helms/aciblobapp-keda-chart/ -f $microservicesFolderPath/Helms/aciblobapp-keda-chart/AKSWorkshop/values-dev.yaml
  
  #helm upgrade aciblobapp-chart -n serverless $microservicesFolderPath/Helms/aciblobapp-keda-chart/ -f $microservicesFolderPath/Helms/aciblobapp-keda-chart/AKSWorkshop/values-dev.yaml
  #helm uninstall aciblobapp-chart -n serverless
  
  #Keep adding large no. of images into Blob Container
  #Check ACIBlobApp deployment on AKS cluster
  #Watch how replicas are scaling up and down
  
  
  #ACIQueueApp
  ================================================================================
  #Deploy ACIQueueApp in serverless namespace
  #App reacts to Blob events
  helm install aciqueueapp-chart -n serverless $microservicesFolderPath/Helms/aciqueueapp-chart/ -f $microservicesFolderPath/Helms/aciqueueapp-chart/AKSWorkshop/values-dev.yaml
  
  #helm upgrade aciqueueapp-chart -n serverless $microservicesFolderPath/Helms/aciqueueapp-chart/ -f $microservicesFolderPath/Helms/aciqueueapp-chart/AKSWorkshop/values-dev.yaml
  #helm uninstall aciqueueapp-chart -n serverless
  
  #Check if app is deployed and no. of replicas running
  kubectl get all -n serverless
  
  #Modify the values-dev.yaml file to update placeholder values
  
  #Deploy KEDA objects in serverless namespace
  #These objects would ensure that the application scales based on Blob trigger
  helm install aciqueueapp-chart -n serverless $microservicesFolderPath/Helms/aciqueueapp-keda-chart/ -f $microservicesFolderPath/Helms/aciqueueapp-keda-chart/AKSWorkshop/values-dev.yaml
  
  #helm upgrade aciblobapp-chart -n serverless $microservicesFolderPath/Helms/aciqueueapp-keda-chart/ -f $microservicesFolderPath/Helms/aciqueueapp-keda-chart/AKSWorkshop/values-dev.yaml
  #helm uninstall aciqueueapp-chart -n serverless
  
  #Keep adding large no. of messages into Queue Container
  #Check ACIQueueApp deployment on AKS cluster
  #Watch how replicas are scaling up and down
  
  ================================================================================
  
  #Uninstall KEDA
  #helm uninstall keda -n keda
  ```

- **Azure Policy**

  - Refer [Policy Reference](https://docs.microsoft.com/en-us/azure/aks/policy-reference)

  - Refer [Policy for K8s](https://docs.microsoft.com/en-us/azure/governance/policy/concepts/policy-for-kubernetes)

    

- **Service Mesh**

  
